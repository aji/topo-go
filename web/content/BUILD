load("@npm//webpack-cli:index.bzl", webpack = "webpack_cli")

_SOURCES = glob(["*.ts"])

webpack(
    name = "bundle",
    outs = ["dist"],
    args = [
        "-o",
        "$@",
        "--config",
        "./$(execpath webpack.config.js)",
        "--entry",
        "./$(execpath main.ts)",
    ],
    data = _SOURCES + [
        "webpack.config.js",
        "//:tsconfig.json",
        "@npm//ts-loader",
    ],
    visibility = ["//visibility:public"],
)
