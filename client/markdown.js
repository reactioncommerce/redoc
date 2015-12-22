//
// Markdown Helper
//
if (Package.templating) {
  let Template = Package.templating.Template;
  let HTML = Package.htmljs.HTML;
  let Blaze = Package.blaze.Blaze;

  Blaze.registerHelper("markdown", Blaze.Template("markdown", function () {
    let view = this;
    let content = '';
    if (view.templateContentBlock) {
      content = Blaze._toText(view.templateContentBlock, HTML.TEXTMODE.STRING);
    }
    return HTML.Raw(md.render(content));
  }));
}
