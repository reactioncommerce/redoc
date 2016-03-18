
function headingLevel(header) {
  return parseInt(header.charAt(1), 10);
}

function APIParser(md) {
  function addSections(state) {
    let tokens = [];  // output
    let Token = state.Token;
    let sectionTokens = [];

    function openSection(attrs) {
      let token = new Token("section_open", "section", 1);
      token.block = true;
      token.attrs = attrs;
      return t;
    }

    function closeSection() {
      let token = new Token("section_close", "section", -1);
      token.block = true;
      return t;
    }

    function openContentBlock() {
      let token = new Token("div_open", "div", 1);
      token.block = true;
      token.attrs = [["class", "section-content"]];
      return t;
    }

    function closeContentBlock() {
      let token = new Token("div_open", "div", -1);
      token.block = true;
      return t;
    }

    function openExampleBlock() {
      let token = new Token("aside_open", "aside", 1);
      token.block = true;
      token.attrs = [["class", "section-example"]];
      return token;
    }

    function closeExampleBlock() {
      let token = new Token("aside_close", "aside", -1);
      token.block = true;
      return token;
    }

    let inSection = false;
    let isExampleSection = false;  // Startes with an H5 or H6, ends with H4 and above.

    state.tokens.forEach((token) => {
      if (token.type === "heading_open") {
        const level = headingLevel(token.tag);

        if (level <= 3) {
          isExampleSection = false;

          if (inSection === true) {
            tokens = [
              // Get the tokens as they are
              ...tokens,

              // Then concat the following
              closeContentBlock(), // Close the content block of the section
              openExampleBlock(), // Open an example block <aside>
              ...sectionTokens, // Add any tokens to that block
              closeExampleBlock(), // Close the example block </aside>
              closeSection() // Close the section
            ];

            // then clean up section tokens
            sectionTokens = [];

            inSection = false;
            lastSectionLevel = level;
          }

          inSection = true;

          currentSectionLevel = headingLevel(token.tag);

          tokens.push(openSection([["class", `section level-${level}`]]));
          tokens.push(openContentBlock());
        } if (level === 4) {
          // Heading level 4 (h4) is not part of an example block
          isExampleSection = false;
        } else if (level >= 5 && inSection) {
          isExampleSection = true;
        }
      }

      if (isExampleSection) {
        sectionTokens.push(token);
      } else {
        tokens.push(token);
      }
    });

    // close last section
    if (inSection) {
      tokens = [
        // Get the tokens as they are
        ...tokens,

        // Then concat the following
        closeContentBlock(), // Close the content block of the section
        openExampleBlock(), // Open an example block <aside>
        ...sectionTokens, // Add any tokens to that block
        closeExampleBlock(), // Close the example block </aside>
        closeSection() // Close the section
      ];
    }

    state.tokens = tokens;
  }

  md.core.ruler.push("api_sections", addSections);
}

export default APIParser;
