// server/src/config/database.ts
mongoose.set("debug", (collectionName, method, query, doc) => {
  logger.debug(`Mongoose: ${collectionName}.${method}`, {
    query: JSON.stringify(query),
    doc: JSON.stringify(doc),
  });
});
