import { QueryResult } from "pg";
import connection from "../database";
import { Recommendation } from "../interfaces/interfaces";

export async function create(name: string, youtubeLink: string, score: number) {
  const result: QueryResult<Recommendation> = await connection.query(
    `
    INSERT INTO recommendations
    (name, "youtubeLink", score)
    VALUES
    ($1, $2, $3)
    RETURNING *
  `,
    [name, youtubeLink, score]
  );
  return result
}

export async function findById(id: number) {
  const result: QueryResult<Recommendation> = await connection.query(
    `
    SELECT * FROM recommendations WHERE id = $1
  `,
    [id]
  );

  return result.rows[0];
}

export async function incrementScore(id: number, increment: number)  {
  const result: QueryResult<Recommendation> =  await connection.query(
    `
    UPDATE recommendations SET score = score + $1 WHERE id = $2 RETURNING *
  `,
    [increment, id]
  );
  return result
}

export async function destroy(id: number) {
  const result = await connection.query(
    `
    DELETE FROM recommendations WHERE id = $1
  `,
    [id]
  );
  return result
}

export async function findRecommendations(
  minScore: number,
  maxScore: number = Infinity,
  orderBy: string = ""
) {
  let where = "";
  let params = [minScore];

  if (maxScore === Infinity) {
    where = "score >= $1";
  } else {
    where = "score BETWEEN $1 AND $2";
    params.push(maxScore);
  }

  let query = `SELECT * FROM recommendations WHERE ${where}`;

  if (orderBy) {
    query += ` ORDER BY ${orderBy}`;
  }

  const result = await connection.query(query, params);

  return result.rows;
}
