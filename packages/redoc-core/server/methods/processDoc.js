import { Meteor } from "meteor/meteor";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import TOCParser from "../../lib/plugins/toc";

const md = MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (code) {
    return hljs.highlightAuto(code).value;
  },
  documentTOC(toc, env) {
    ReDoc.Collections.TOC.update({
      repo: env.repo,
      // branch: env.branch,
      alias: env.alias
    }, {
      $set: {
        documentTOC: toc
      }
    });
  },

  replaceLink: (link, env) => {
    const isImage = link.search(/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i) > -1;
    const hasProtocol = link.search(/^http[s]?\:\/\//) > -1;
    let newLink = link;
    if (isImage && !hasProtocol) {
      newLink = `${env.rawUrl}/${env.branch}/${link}`;
    }
    // general link replacement for relative repo links
    if (!isImage && !hasProtocol) {
      switch (link.charAt(0)) {
      case "#":
        newLink = `/${env.repo}/${env.branch}/${env.alias}${link}`;
        break;
      case "/":
        tocItem = ReDoc.Collections.TOC.findOne({
          docPath: link.substring(1)
        });
        if (tocItem) {
          newLink = `/${tocItem.repo}/${env.branch}/${tocItem.alias}`;
        }
        break;
      default:
        newlink = link;
      }
    }
    return newLink;
  }
})
.use(require("markdown-it-replace-link"))
.use(TOCParser);


function article({ docUrl, content }) {
  return (
// This indentation and spacing is correct, leave it alone.
// Otherwise markdown-it might mistake this for a code block rather than just html.
`
<article class="subdoc">
  <header>
    <a href="${docUrl}">Edit on GitHub</a>
  </header>

  ${content}

</article>
`
  );
}

function processDoc({docRepo, tocItem, ...options}) {
  const alias = options.alias || tocItem.alias;
  const style = options.style || tocItem.style;
  const rawUrl = options.rawUrl || docRepo.rawUrl;
  const repo = options.repo;
  const branch = options.branch || "master";
  const docPath = tocItem.docPath;
  const docHtmlUrl = docRepo.data.html_url;
  const docSourceUrl = `${rawUrl}/${branch}/${docPath}`;
  const docRepoUrl = `${docHtmlUrl}/tree/${branch}/${docPath}`;

  // lets fetch that Github repo
  Meteor.http.get(docSourceUrl, function (error, result) {
    if (error) return error;
    if (result.statusCode === 200) {
      // sensible defaults for every repo
      let docSet = ReDoc.getPathParams(docSourceUrl);
      docSet.docPage = docSourceUrl;
      docSet.docPath = docPath;

      // if TOC has different alias, we'll use that
      if (alias) {
        docSet.alias = alias;
      }

      // if TOC has different label, we'll use that
      if (tocItem.label) {
        let label = tocItem.label;
        if (tocItem.parentPath) {
          const parentDoc = ReDoc.Collections.TOC.findOne({ docPath: tocItem.parentPath + "/README.md" });

          if (parentDoc) {
            label = parent.label + " - " + label;
          }
        }
        docSet.label = label;
      }

      // pre-process documentation
      if (!result.content) {
        console.log(`redoc/getDocSet: Docset not found for ${docSet.docPath}.`);
        result.content = `# Not found. \n  ${docSourceUrl}`; // default not found, should replace with custom tpl.
      }

      let documentContent = article({
        docUrl: docRepoUrl,
        content: result.content
      });

      docSet.docPageContent = documentContent;
      docSet.docPageContentHTML = md.render(documentContent, {
        rawUrl,
        branch,
        alias: docSet.alias,
        repo,
        style
      });

      // insert new documentation into Cache
      return ReDoc.Collections.Docs.upsert({
        docPage: docSourceUrl
      }, {
        $set: docSet
      });
    }
  });
}

export default processDoc;
export { article };
