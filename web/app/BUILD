load("@npm//@bazel/typescript:index.bzl", "ts_project")
load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")

ts_project(
    name = "compile",
    srcs = glob(["**/*.ts"]),
    declaration = True,
    extends = "@topo-go//:tsconfig.json",
    tsconfig = "tsconfig.json",
    visibility = ["//visibility:public"],
    deps = [
        "//game",
        "//web/api-v1",
        "@npm//@types",
        "@npm//ejs",
        "@npm//express",
        "@npm//pino",
    ],
)

nodejs_binary(
    name = "app",
    data = [
        ":compile",
        "//web/content:dist",
    ] + glob([
        "views/*",
        "static/*",
    ]),
    entry_point = "index.ts",
)
