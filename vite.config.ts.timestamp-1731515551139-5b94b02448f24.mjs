// vite.config.ts
import { readFile as readFile3 } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { defineConfig } from "file:///home/user/work/router/node_modules/vite/dist/node/index.js";

// scripts/constructCss.ts
import { readFile } from "node:fs/promises";
import cssnanoPlugin from "file:///home/user/work/router/node_modules/cssnano/src/index.js";
import postcss from "file:///home/user/work/router/node_modules/postcss/lib/postcss.mjs";
import nestedImport from "file:///home/user/work/router/node_modules/postcss-nested-import/index.js";
var cssTransformer = postcss([
  nestedImport(),
  cssnanoPlugin({
    preset: "default"
  })
]);
function constructCss() {
  const styles = /* @__PURE__ */ new Map();
  return {
    enforce: "post",
    name: "vite-construct-css",
    async load(id) {
      if (id.endsWith(".css?ctr")) {
        const content = await readFile(id.substring(0, id.length - 4), "utf8");
        styles.set(id, content);
        return {
          code: ""
        };
      }
      return void 0;
    },
    async transform(_, id) {
      if (styles.has(id)) {
        const css = styles.get(id);
        const { content } = await cssTransformer.process(css, {
          from: id
        });
        return {
          code: `const css = new CSSStyleSheet(); css.replaceSync(${JSON.stringify(content)}); export default css;`
        };
      }
      return void 0;
    }
  };
}

// scripts/loadRegisterJs.ts
import { readFile as readFile2 } from "node:fs/promises";
import MagicString from "file:///home/user/work/router/node_modules/magic-string/dist/magic-string.es.mjs";
var __vite_injected_original_import_meta_url = "file:///home/user/work/router/scripts/loadRegisterJs.ts";
var scripts = new URL("./", __vite_injected_original_import_meta_url);
function loadRegisterJs() {
  return {
    enforce: "pre",
    name: "vite-hilla-register",
    async transform(code) {
      if (code.includes("__REGISTER__()") && !code.includes("function __REGISTER__")) {
        const registerCode = await readFile2(new URL("register.js", scripts), "utf8").then(
          (c) => c.replace("export", "")
        );
        const _code = new MagicString(code);
        _code.prepend(registerCode);
        return {
          code: _code.toString(),
          map: _code.generateMap()
        };
      }
      return null;
    }
  };
}

// vite.config.ts
var __vite_injected_original_import_meta_url2 = "file:///home/user/work/router/vite.config.ts";
var root = new URL("./", __vite_injected_original_import_meta_url2);
var packageJson = await readFile3(new URL("./package.json", root), "utf8").then(JSON.parse);
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "/base": ""
      // support '/base' prefix for karma
    }
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        importAttributesKey: "with"
      }
    }
  },
  esbuild: {
    define: {
      __NAME__: `'${packageJson.name ?? "@hilla/unknown"}'`,
      __VERSION__: `'${packageJson.version ?? "0.0.0"}'`
    },
    supported: {
      decorators: false,
      "import-attributes": true,
      "top-level-await": true
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      supported: {
        decorators: false,
        "import-attributes": true,
        "top-level-await": true
      },
      target: "esnext"
    }
  },
  plugins: [loadRegisterJs(), constructCss()],
  root: fileURLToPath(root)
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic2NyaXB0cy9jb25zdHJ1Y3RDc3MudHMiLCAic2NyaXB0cy9sb2FkUmVnaXN0ZXJKcy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3VzZXIvd29yay9yb3V0ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3VzZXIvd29yay9yb3V0ZXIvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdXNlci93b3JrL3JvdXRlci92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IHJlYWRGaWxlIH0gZnJvbSAnbm9kZTpmcy9wcm9taXNlcyc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHR5cGUgeyBQYWNrYWdlSnNvbiB9IGZyb20gJ3R5cGUtZmVzdCc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCBjb25zdHJ1Y3RDc3MgZnJvbSAnLi9zY3JpcHRzL2NvbnN0cnVjdENzcy5qcyc7XG5pbXBvcnQgbG9hZFJlZ2lzdGVySnMgZnJvbSAnLi9zY3JpcHRzL2xvYWRSZWdpc3RlckpzJztcblxuY29uc3Qgcm9vdCA9IG5ldyBVUkwoJy4vJywgaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IHBhY2thZ2VKc29uOiBQYWNrYWdlSnNvbiA9IGF3YWl0IHJlYWRGaWxlKG5ldyBVUkwoJy4vcGFja2FnZS5qc29uJywgcm9vdCksICd1dGY4JykudGhlbihKU09OLnBhcnNlKTtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJy9iYXNlJzogJycsIC8vIHN1cHBvcnQgJy9iYXNlJyBwcmVmaXggZm9yIGthcm1hXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlc25leHQnLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBpbXBvcnRBdHRyaWJ1dGVzS2V5OiAnd2l0aCcsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIGVzYnVpbGQ6IHtcbiAgICBkZWZpbmU6IHtcbiAgICAgIF9fTkFNRV9fOiBgJyR7cGFja2FnZUpzb24ubmFtZSA/PyAnQGhpbGxhL3Vua25vd24nfSdgLFxuICAgICAgX19WRVJTSU9OX186IGAnJHtwYWNrYWdlSnNvbi52ZXJzaW9uID8/ICcwLjAuMCd9J2AsXG4gICAgfSxcbiAgICBzdXBwb3J0ZWQ6IHtcbiAgICAgIGRlY29yYXRvcnM6IGZhbHNlLFxuICAgICAgJ2ltcG9ydC1hdHRyaWJ1dGVzJzogdHJ1ZSxcbiAgICAgICd0b3AtbGV2ZWwtYXdhaXQnOiB0cnVlLFxuICAgIH0sXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICBzdXBwb3J0ZWQ6IHtcbiAgICAgICAgZGVjb3JhdG9yczogZmFsc2UsXG4gICAgICAgICdpbXBvcnQtYXR0cmlidXRlcyc6IHRydWUsXG4gICAgICAgICd0b3AtbGV2ZWwtYXdhaXQnOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW2xvYWRSZWdpc3RlckpzKCksIGNvbnN0cnVjdENzcygpXSxcbiAgcm9vdDogZmlsZVVSTFRvUGF0aChyb290KSxcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS91c2VyL3dvcmsvcm91dGVyL3NjcmlwdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3VzZXIvd29yay9yb3V0ZXIvc2NyaXB0cy9jb25zdHJ1Y3RDc3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdXNlci93b3JrL3JvdXRlci9zY3JpcHRzL2NvbnN0cnVjdENzcy50c1wiO2ltcG9ydCB7IHJlYWRGaWxlIH0gZnJvbSAnbm9kZTpmcy9wcm9taXNlcyc7XG5pbXBvcnQgY3NzbmFub1BsdWdpbiBmcm9tICdjc3NuYW5vJztcbmltcG9ydCBwb3N0Y3NzIGZyb20gJ3Bvc3Rjc3MnO1xuaW1wb3J0IG5lc3RlZEltcG9ydCBmcm9tICdwb3N0Y3NzLW5lc3RlZC1pbXBvcnQnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuY29uc3QgY3NzVHJhbnNmb3JtZXIgPSBwb3N0Y3NzKFtcbiAgbmVzdGVkSW1wb3J0KCksXG4gIGNzc25hbm9QbHVnaW4oe1xuICAgIHByZXNldDogJ2RlZmF1bHQnLFxuICB9KSxcbl0pO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb25zdHJ1Y3RDc3MoKTogUGx1Z2luIHtcbiAgY29uc3Qgc3R5bGVzID0gbmV3IE1hcCgpO1xuXG4gIHJldHVybiB7XG4gICAgZW5mb3JjZTogJ3Bvc3QnLFxuICAgIG5hbWU6ICd2aXRlLWNvbnN0cnVjdC1jc3MnLFxuICAgIGFzeW5jIGxvYWQoaWQpIHtcbiAgICAgIGlmIChpZC5lbmRzV2l0aCgnLmNzcz9jdHInKSkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgcmVhZEZpbGUoaWQuc3Vic3RyaW5nKDAsIGlkLmxlbmd0aCAtIDQpLCAndXRmOCcpO1xuICAgICAgICBzdHlsZXMuc2V0KGlkLCBjb250ZW50KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjb2RlOiAnJyxcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9LFxuICAgIGFzeW5jIHRyYW5zZm9ybShfLCBpZCkge1xuICAgICAgaWYgKHN0eWxlcy5oYXMoaWQpKSB7XG4gICAgICAgIGNvbnN0IGNzcyA9IHN0eWxlcy5nZXQoaWQpO1xuXG4gICAgICAgIGNvbnN0IHsgY29udGVudCB9ID0gYXdhaXQgY3NzVHJhbnNmb3JtZXIucHJvY2Vzcyhjc3MsIHtcbiAgICAgICAgICBmcm9tOiBpZCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjb2RlOiBgY29uc3QgY3NzID0gbmV3IENTU1N0eWxlU2hlZXQoKTsgY3NzLnJlcGxhY2VTeW5jKCR7SlNPTi5zdHJpbmdpZnkoY29udGVudCl9KTsgZXhwb3J0IGRlZmF1bHQgY3NzO2AsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSxcbiAgfTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvdXNlci93b3JrL3JvdXRlci9zY3JpcHRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS91c2VyL3dvcmsvcm91dGVyL3NjcmlwdHMvbG9hZFJlZ2lzdGVySnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdXNlci93b3JrL3JvdXRlci9zY3JpcHRzL2xvYWRSZWdpc3RlckpzLnRzXCI7aW1wb3J0IHsgcmVhZEZpbGUgfSBmcm9tICdub2RlOmZzL3Byb21pc2VzJztcbmltcG9ydCBNYWdpY1N0cmluZyBmcm9tICdtYWdpYy1zdHJpbmcnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuY29uc3Qgc2NyaXB0cyA9IG5ldyBVUkwoJy4vJywgaW1wb3J0Lm1ldGEudXJsKTtcblxuLy8gVGhpcyBwbHVnaW4gYWRkcyBcIl9fUkVHSVNURVJfXygpXCIgZnVuY3Rpb24gZGVmaW5pdGlvbiBldmVyeXdoZXJlIHdoZXJlIGl0IGZpbmRzXG4vLyB0aGUgY2FsbCBmb3IgdGhhdCBmdW5jdGlvbi4gSXQgaXMgbmVjZXNzYXJ5IGZvciBhIGNvcnJlY3QgY29kZSBmb3IgdGVzdHMuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsb2FkUmVnaXN0ZXJKcygpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIGVuZm9yY2U6ICdwcmUnLFxuICAgIG5hbWU6ICd2aXRlLWhpbGxhLXJlZ2lzdGVyJyxcbiAgICBhc3luYyB0cmFuc2Zvcm0oY29kZSkge1xuICAgICAgaWYgKGNvZGUuaW5jbHVkZXMoJ19fUkVHSVNURVJfXygpJykgJiYgIWNvZGUuaW5jbHVkZXMoJ2Z1bmN0aW9uIF9fUkVHSVNURVJfXycpKSB7XG4gICAgICAgIGNvbnN0IHJlZ2lzdGVyQ29kZSA9IGF3YWl0IHJlYWRGaWxlKG5ldyBVUkwoJ3JlZ2lzdGVyLmpzJywgc2NyaXB0cyksICd1dGY4JykudGhlbigoYykgPT5cbiAgICAgICAgICBjLnJlcGxhY2UoJ2V4cG9ydCcsICcnKSxcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBfY29kZTogTWFnaWNTdHJpbmcgPSBuZXcgTWFnaWNTdHJpbmcoY29kZSk7XG4gICAgICAgIF9jb2RlLnByZXBlbmQocmVnaXN0ZXJDb2RlKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNvZGU6IF9jb2RlLnRvU3RyaW5nKCksXG4gICAgICAgICAgbWFwOiBfY29kZS5nZW5lcmF0ZU1hcCgpLFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICB9O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvUCxTQUFTLFlBQUFBLGlCQUFnQjtBQUM3USxTQUFTLHFCQUFxQjtBQUU5QixTQUFTLG9CQUFvQjs7O0FDSGlQLFNBQVMsZ0JBQWdCO0FBQ3ZTLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8sYUFBYTtBQUNwQixPQUFPLGtCQUFrQjtBQUd6QixJQUFNLGlCQUFpQixRQUFRO0FBQUEsRUFDN0IsYUFBYTtBQUFBLEVBQ2IsY0FBYztBQUFBLElBQ1osUUFBUTtBQUFBLEVBQ1YsQ0FBQztBQUNILENBQUM7QUFFYyxTQUFSLGVBQXdDO0FBQzdDLFFBQU0sU0FBUyxvQkFBSSxJQUFJO0FBRXZCLFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLE1BQU0sS0FBSyxJQUFJO0FBQ2IsVUFBSSxHQUFHLFNBQVMsVUFBVSxHQUFHO0FBQzNCLGNBQU0sVUFBVSxNQUFNLFNBQVMsR0FBRyxVQUFVLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxNQUFNO0FBQ3JFLGVBQU8sSUFBSSxJQUFJLE9BQU87QUFDdEIsZUFBTztBQUFBLFVBQ0wsTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBRUEsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLE1BQU0sVUFBVSxHQUFHLElBQUk7QUFDckIsVUFBSSxPQUFPLElBQUksRUFBRSxHQUFHO0FBQ2xCLGNBQU0sTUFBTSxPQUFPLElBQUksRUFBRTtBQUV6QixjQUFNLEVBQUUsUUFBUSxJQUFJLE1BQU0sZUFBZSxRQUFRLEtBQUs7QUFBQSxVQUNwRCxNQUFNO0FBQUEsUUFDUixDQUFDO0FBRUQsZUFBTztBQUFBLFVBQ0wsTUFBTSxvREFBb0QsS0FBSyxVQUFVLE9BQU8sQ0FBQztBQUFBLFFBQ25GO0FBQUEsTUFDRjtBQUVBLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUNGOzs7QUM5Q2tSLFNBQVMsWUFBQUMsaUJBQWdCO0FBQzNTLE9BQU8saUJBQWlCO0FBRCtJLElBQU0sMkNBQTJDO0FBSXhOLElBQU0sVUFBVSxJQUFJLElBQUksTUFBTSx3Q0FBZTtBQUk5QixTQUFSLGlCQUEwQztBQUMvQyxTQUFPO0FBQUEsSUFDTCxTQUFTO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixNQUFNLFVBQVUsTUFBTTtBQUNwQixVQUFJLEtBQUssU0FBUyxnQkFBZ0IsS0FBSyxDQUFDLEtBQUssU0FBUyx1QkFBdUIsR0FBRztBQUM5RSxjQUFNLGVBQWUsTUFBTUMsVUFBUyxJQUFJLElBQUksZUFBZSxPQUFPLEdBQUcsTUFBTSxFQUFFO0FBQUEsVUFBSyxDQUFDLE1BQ2pGLEVBQUUsUUFBUSxVQUFVLEVBQUU7QUFBQSxRQUN4QjtBQUVBLGNBQU0sUUFBcUIsSUFBSSxZQUFZLElBQUk7QUFDL0MsY0FBTSxRQUFRLFlBQVk7QUFFMUIsZUFBTztBQUFBLFVBQ0wsTUFBTSxNQUFNLFNBQVM7QUFBQSxVQUNyQixLQUFLLE1BQU0sWUFBWTtBQUFBLFFBQ3pCO0FBQUEsTUFDRjtBQUVBLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUNGOzs7QUY5Qm9KLElBQU1DLDRDQUEyQztBQU9yTSxJQUFNLE9BQU8sSUFBSSxJQUFJLE1BQU1BLHlDQUFlO0FBQzFDLElBQU0sY0FBMkIsTUFBTUMsVUFBUyxJQUFJLElBQUksa0JBQWtCLElBQUksR0FBRyxNQUFNLEVBQUUsS0FBSyxLQUFLLEtBQUs7QUFHeEcsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsU0FBUztBQUFBO0FBQUEsSUFDWDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLHFCQUFxQjtBQUFBLE1BQ3ZCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLFFBQVE7QUFBQSxNQUNOLFVBQVUsSUFBSSxZQUFZLFFBQVEsZ0JBQWdCO0FBQUEsTUFDbEQsYUFBYSxJQUFJLFlBQVksV0FBVyxPQUFPO0FBQUEsSUFDakQ7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNULFlBQVk7QUFBQSxNQUNaLHFCQUFxQjtBQUFBLE1BQ3JCLG1CQUFtQjtBQUFBLElBQ3JCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osZ0JBQWdCO0FBQUEsTUFDZCxXQUFXO0FBQUEsUUFDVCxZQUFZO0FBQUEsUUFDWixxQkFBcUI7QUFBQSxRQUNyQixtQkFBbUI7QUFBQSxNQUNyQjtBQUFBLE1BQ0EsUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTLENBQUMsZUFBZSxHQUFHLGFBQWEsQ0FBQztBQUFBLEVBQzFDLE1BQU0sY0FBYyxJQUFJO0FBQzFCLENBQUM7IiwKICAibmFtZXMiOiBbInJlYWRGaWxlIiwgInJlYWRGaWxlIiwgInJlYWRGaWxlIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAicmVhZEZpbGUiXQp9Cg==
