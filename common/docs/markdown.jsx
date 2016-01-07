
export default class ReMarkdown extends React.Component {
  render() {
    const content = {
      __html: this.props.content
    };

    return (
      <div className="content-html" dangerouslySetInnerHTML={content}></div>
    );
  }
}
