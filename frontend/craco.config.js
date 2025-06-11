module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          ajv: require.resolve("ajv"),
          "ajv-keywords": require.resolve("ajv-keywords"),
          "schema-utils": require.resolve("schema-utils"),
        },
      },
    },
  },
};
