/* ────────────────────────────────────────────────────────────
   Scene Preview for Decap CMS
   Renders a live preview of the home-page parallax scene
   as the editor changes scene fields (preset, far, mid, etc.).
   ──────────────────────────────────────────────────────────── */

(function () {
  // ── Register scene-composer.css for the preview iframe ──
  CMS.registerPreviewStyle("/assets/css/scene-composer.css");

  // ── Structural CSS that lives in main.css (subset needed for scenes) ──
  var SCENE_CSS = [
    "@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;700;800&family=Instrument+Serif:ital@1&display=swap');",
    ":root {",
    "  --font-display: 'Bricolage Grotesque', system-ui, sans-serif;",
    "  --font-serif: 'Instrument Serif', Georgia, serif;",
    "}",
    ".scene {",
    "  position: relative;",
    "  min-height: 500px;",
    "  width: 100%;",
    "  overflow: hidden;",
    "  isolation: isolate;",
    "  background: var(--c-sky-1);",
    "  border-radius: 8px;",
    "  margin-bottom: 20px;",
    "}",
    ".scene .layer {",
    "  position: absolute; inset: 0; pointer-events: none;",
    "}",
    ".scene .layer-sky    { z-index: 1; }",
    ".scene .layer-far    { z-index: 2; }",
    ".scene .scene-title  { z-index: 3; }",
    ".scene .layer-mid    { z-index: 4; }",
    ".scene .layer-front  { z-index: 5; }",
    ".scene-title {",
    "  position: absolute; inset: 0;",
    "  display: grid; place-items: center;",
    "  pointer-events: none;",
    "}",
    ".scene-title h2 {",
    "  font-family: var(--font-display); font-weight: 800;",
    "  font-size: clamp(3rem, 12vw, 10rem);",
    "  line-height: 0.78; letter-spacing: -0.05em;",
    "  color: rgba(255,255,255,0.92);",
    "  text-align: center;",
    "  text-shadow: 0 2px 40px rgba(0,0,0,0.4), 0 0 80px rgba(0,0,0,0.2);",
    "}",
    ".scene-title h2 em {",
    "  font-family: var(--font-serif); font-style: italic; font-weight: 400;",
    "  color: var(--c-accent); font-size: 0.85em;",
    "}",
    ".atmosphere {",
    "  position: absolute; inset: 0;",
    "  pointer-events: none;",
    "  z-index: 7;",
    "  overflow: hidden;",
    "}",
    ".sprite-holder { position: absolute; width: 0; height: 0; overflow: hidden; }",
    ".preview-note {",
    "  padding: 16px 20px;",
    "  background: #f0ebe3;",
    "  border: 1px solid #d5cfc5;",
    "  border-radius: 6px;",
    "  color: #5a5040;",
    "  font-family: system-ui, sans-serif;",
    "  font-size: 14px;",
    "  margin-bottom: 16px;",
    "}",
    ".preview-label {",
    "  font-family: system-ui, sans-serif;",
    "  font-size: 11px;",
    "  font-weight: 600;",
    "  text-transform: uppercase;",
    "  letter-spacing: 0.08em;",
    "  color: #8a7e6a;",
    "  margin-bottom: 8px;",
    "}",
  ].join("\n");

  CMS.registerPreviewStyle(SCENE_CSS, { raw: true });

  // ── Cached sprite SVG content ──
  var spriteCache = null;
  var spriteFetchPromise = null;

  function fetchSprite() {
    if (spriteCache) return Promise.resolve(spriteCache);
    if (spriteFetchPromise) return spriteFetchPromise;
    spriteFetchPromise = fetch("/admin/scene-sprite.svg")
      .then(function (r) { return r.text(); })
      .then(function (text) {
        spriteCache = text;
        return text;
      })
      .catch(function () {
        spriteCache = "";
        return "";
      });
    return spriteFetchPromise;
  }

  // ── Helper: create an SVG element referencing a sprite symbol ──
  var h = CMS.h || window.h;
  var createClass = CMS.createClass || window.createClass;

  function svgUse(elName) {
    // React doesn't handle SVG <use> with href well, so use dangerouslySetInnerHTML
    return h("svg", {
      dangerouslySetInnerHTML: {
        __html: '<use href="#el-' + elName + '"/>'
      }
    });
  }

  // ── Build a scene-el div with appropriate classes ──
  function sceneEl(elName, slot, dataLayer) {
    if (!elName) return null;
    var classes = "scene-el el-" + elName + " " + slot;
    var props = { className: classes };
    if (dataLayer) props["data-layer"] = dataLayer;
    return h("div", props, svgUse(elName));
  }

  // ── Split destination name for poster typography ──
  function renderTitle(destination) {
    if (!destination) return h("h2", {}, "Destination");
    var words = destination.split(" ");
    if (words.length > 1) {
      return h("h2", {},
        words[0] + " ",
        h("em", {}, words.slice(1).join(" "))
      );
    }
    return h("h2", {}, destination);
  }

  // ── The Preview Component ──
  var ScenePreview = createClass({
    getInitialState: function () {
      return { spriteLoaded: false };
    },

    componentDidMount: function () {
      var self = this;
      fetchSprite().then(function () {
        self.setState({ spriteLoaded: true });
      });
    },

    render: function () {
      var entry = this.props.entry;
      var featured = entry.getIn(["data", "featured"]);

      // Read scene fields from entry data
      var sceneType = entry.getIn(["data", "scene", "type"]) || "skyscape";
      var preset = entry.getIn(["data", "scene", "preset"]) || "clear_day";
      var far = entry.getIn(["data", "scene", "far"]) || "";
      var mid = entry.getIn(["data", "scene", "mid"]) || "";
      var front = entry.getIn(["data", "scene", "front"]) || "";
      var skyLeft = entry.getIn(["data", "scene", "sky_left"]) || "";
      var skyCenter = entry.getIn(["data", "scene", "sky_center"]) || "";
      var skyRight = entry.getIn(["data", "scene", "sky_right"]) || "";
      var atmosphere = entry.getIn(["data", "scene", "atmosphere"]);
      var destination = entry.getIn(["data", "destination"]) || "Destination";

      // Normalize atmosphere to array
      var atmosList = [];
      if (atmosphere) {
        if (typeof atmosphere.toJS === "function") {
          atmosList = atmosphere.toJS();
        } else if (Array.isArray(atmosphere)) {
          atmosList = atmosphere;
        }
      }

      // If not featured, show a note instead of the scene
      if (!featured) {
        return h("div", {},
          h("div", { className: "preview-note" },
            "Scene preview is only shown for featured posts. Check \"Featured on Home Page\" to see the scene preview."
          ),
          this.props.widgetFor("body")
        );
      }

      // Build scene layers
      var children = [];

      // Sprite holder (hidden SVG with all symbols)
      if (this.state.spriteLoaded && spriteCache) {
        children.push(
          h("div", {
            className: "sprite-holder",
            dangerouslySetInnerHTML: { __html: spriteCache }
          })
        );
      }

      // Sky layer
      var skyChildren = [];
      if (skyLeft) skyChildren.push(sceneEl(skyLeft, "slot-sky-left"));
      if (skyCenter) skyChildren.push(sceneEl(skyCenter, "slot-sky-center"));
      if (skyRight) skyChildren.push(sceneEl(skyRight, "slot-sky-right"));
      children.push(h("div", { className: "layer layer-sky" }, skyChildren));

      // Far layer
      if (far) {
        children.push(
          h("div", { className: "layer layer-far" },
            sceneEl(far, "slot-far-full", "far")
          )
        );
      } else {
        children.push(h("div", { className: "layer layer-far" }));
      }

      // Scene title
      children.push(
        h("div", { className: "scene-title" }, renderTitle(destination))
      );

      // Mid layer
      if (mid) {
        children.push(
          h("div", { className: "layer layer-mid" },
            sceneEl(mid, "slot-mid-full", "mid")
          )
        );
      } else {
        children.push(h("div", { className: "layer layer-mid" }));
      }

      // Front layer
      if (front) {
        children.push(
          h("div", { className: "layer layer-front" },
            sceneEl(front, "slot-front-full", "front")
          )
        );
      } else {
        children.push(h("div", { className: "layer layer-front" }));
      }

      // Atmosphere overlays
      for (var i = 0; i < atmosList.length; i++) {
        children.push(h("div", { className: "atmosphere " + atmosList[i] }));
      }

      return h("div", {},
        h("div", { className: "preview-label" }, "Scene Preview"),
        h("section", {
          className: "scene scene-featured",
          "data-type": sceneType,
          "data-preset": preset
        }, children),
        this.props.widgetFor("body")
      );
    }
  });

  CMS.registerPreviewTemplate("posts", ScenePreview);
})();
