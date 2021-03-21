load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary", "npm_package_bin")

_SOURCES = glob(["*.ts"])

nodejs_binary(
    name = "bundler",
    data = _SOURCES + [
        "//:tsconfig.json",
        "@npm//ts-loader",
        "@npm//webpack",
        "@npm//pino",
    ],
    entry_point = "bundler.js",
)

npm_package_bin(
    name = "dist",
    output_dir = True,
    tool = "bundler",
    visibility = ["//visibility:public"],
)
