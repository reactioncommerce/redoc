import { BrowserPolicy } from "meteor/browser-policy-common";

BrowserPolicy.content.allowOriginForAll("*.github.io");
BrowserPolicy.content.allowOriginForAll("*.github.com");
BrowserPolicy.content.allowOriginForAll("raw.githubusercontent.com");
BrowserPolicy.content.allowOriginForAll("www.google-analytics.com");
BrowserPolicy.content.allowOriginForAll("cdn.segment.com");
BrowserPolicy.content.allowOriginForAll("fonts.googleapis.com");
BrowserPolicy.content.allowOriginForAll("netdna.bootstrapcdn.com");
BrowserPolicy.content.allowOriginForAll("fonts.gstatic.com");
BrowserPolicy.content.allowOriginForAll("*.cloudfront.net");
BrowserPolicy.content.allowOriginForAll("widget.intercom.io");
BrowserPolicy.content.allowOriginForAll("sidecar.gitter.im");
BrowserPolicy.content.allowOriginForAll("js.intercomcdn.com");
BrowserPolicy.content.allowOriginForAll("badges.gitter.im");
