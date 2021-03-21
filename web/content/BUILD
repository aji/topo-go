load("@npm//webpack-cli:index.bzl", webpack = "webpack_cli")

_SOURCES = glob(["*.ts"])

webpack(
    name = "dist",
    args = [
        "./$(execpath main.ts)",
        "--config",
        "$(execpath webpack.config.js)",
        "-o",
        "$(@D)",
    ],
    data = _SOURCES + [
        "webpack.config.js",
        "//:tsconfig.json",
        "@npm//:node_modules",
    ],
    output_dir = True,
    visibility = ["//visibility:public"],
)
