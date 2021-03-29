load("@npm//@bazel/typescript:index.bzl", "ts_project")
load("@npm//jest:index.bzl", "jest_test")

ts_project(
    name = "api-v1",
    srcs = glob(
        include = ["*.ts"],
        exclude = ["*.test.ts"],
    ),
    composite = True,
    declaration = True,
    extends = "@topo-go//:tsconfig.json",
    tsconfig = "tsconfig.json",
    visibility = ["//visibility:public"],
)

ts_project(
    name = "test_sources",
    srcs = glob(["*.test.ts"]),
    composite = True,
    declaration = True,
    extends = "@topo-go//:tsconfig.json",
    tsconfig = "tsconfig.json",
    deps = [
        ":api-v1",
        "@npm//@types",
        "@npm//jest",
    ],
)

jest_test(
    name = "test",
    args = [
        "--config=$(rootpaths //:jest.config.js)",
        "--rootDir=" + package_name(),
        "--watchAll=false",
        "--no-cache",
        "--no-watchman",
        "--ci",
        "--runTestsByPath",
        "$(rootpaths :test_sources)",
    ],
    data = [
        ":test_sources",
        "//:jest.config.js",
    ],
)
