load("@npm//@bazel/typescript:index.bzl", "ts_project")

ts_project(
    name = "game",
    srcs = glob(["*.ts"]),
    composite = True,
    declaration = True,
    extends = "@topo-go//:tsconfig.json",
    tsconfig = "tsconfig.json",
    visibility = ["//visibility:public"],
)
