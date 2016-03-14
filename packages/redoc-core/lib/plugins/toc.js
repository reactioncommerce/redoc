"use strict";

import _ from "underscore"

function isBlankString(str) {
  return !!(str||'').match(/^\s*$/);
}

function replaceAttr(token, attrName, replace, env) {
  token.attrs.forEach(function (attr) {
    if (attr[0] === attrName) {
      attr[1] = replace(attr[1], env, token);
    }
  });
}

function slugify(value) {
  return value.toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
    .replace(/[\s_-]+/g, "-") // swap any length of whitespace, underscore, hyphen characters with a single -
    .replace(/^-+|-+$/g, ""); // remove leading, trailing -
}

function TOCParser(md) {
  md.core.ruler.after(
    "inline",
    "replace-link",
    function (state) {
      // var replace = md.options.replaceLink;

      let documentTOC = [];

      state.tokens.forEach(function (blockToken, index) {
        // Look for open header tags
        if (blockToken.type === "heading_open") {
          const nextToken = state.tokens[index + 1];
          const headingLevel = parseInt(blockToken.tag.replace("h", ""), 10);

          if (headingLevel <= 1 || headingLevel > 4) {
            return;
          }

          // This is the content of the heading
          if (nextToken.type === "inline" && nextToken.children) {
            for (let node of nextToken.children) {
              if (node.type === "text" || nextToken.type === "inline") {
                const data = {
                  level: headingLevel,
                  content: node.content,
                  slug: slugify(node.content)
                };
                const { alias, repo, branch} = state.env;
                const slug = slugify(node.content);
                // console.log("Heading level", headingLevel, "for content", node.content);

                if (_.isFunction(md.options.processTOCHeadings)) {
                  md.options.processTOCHeadings(data, state.env);
                }

                blockToken.attrs = [["id", slug]];

                if (!isBlankString(node.content)) {
                  documentTOC.push({
                    className: `guide-sub-subnav-item level-${headingLevel}`,
                    label: node.content || "--",
                    docPath: `/${repo}/${branch}/${alias}#${slug}`
                  });
                }
                break;
              }
            }
          }
        }
      });

      if (_.isFunction(md.options.documentTOC)) {
        md.options.documentTOC(documentTOC, state.env);
      }

      return false;
    }
  );
}

export default TOCParser;
