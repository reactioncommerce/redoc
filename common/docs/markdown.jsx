
import "highlight.js";
import punycode from "punycode";
import "markdown-it";
import _ from "underscore";

// export let _ = require("underscore");
export let hljs = require("highlight.js");

md = require("markdown-it")({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (code) {
    return hljs.highlightAuto(code).value;
  }
});

export default class ReMarkdown extends React.Component {
  render() {
    const content = {
      __html: md.render(this.props.content)
    };

    return (
      <div className="content-html" dangerouslySetInnerHTML={content}></div>
    );
  }
}
