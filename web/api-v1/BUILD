load("@npm//@bazel/typescript:index.bzl", "ts_project")

ts_project(
    name = "api-v1",
    srcs = glob(["*.ts"]),
    composite = True,
    declaration = True,
    extends = "@topo-go//:tsconfig.json",
    tsconfig = "tsconfig.json",
    visibility = ["//visibility:public"],
)
