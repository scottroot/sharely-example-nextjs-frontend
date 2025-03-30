import * as neo4j from "neo4j-driver";


/**
 * Exports Neo4j's isInt utility function.
 *
 * This function checks if a given value is a Neo4j Integer type.
 * Helpful when handling Neo4j's native integer format, which may require
 * conversion to JavaScript numbers.
 */
export const isInt = neo4j.isInt;

/**
 * Neo4j connection settings loaded from environment variables.
 */
const { NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD } = process.env;
console.log(JSON.stringify({NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD}))

/**
 * Creates and exports a Neo4j driver instance for database connections.
 * This driver is used throughout the app to execute queries.
 */
export const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(
    NEO4J_USERNAME,
    NEO4J_PASSWORD
  )
)
