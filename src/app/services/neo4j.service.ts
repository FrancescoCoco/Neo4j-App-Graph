import { Injectable } from '@angular/core';
import neo4j from 'neo4j-driver';

@Injectable({
  providedIn: 'root'
})
export class Neo4jService {
  private driver;

  constructor() {
    this.driver = neo4j.driver(
      'bolt://localhost:7687',
      neo4j.auth.basic('neo4j', 'm0novo01')
    );
  }

  async runQuery(query: string, params: any = {}) {
    const session = this.driver.session();

    try {
      const result = await session.run(query, params);
      return result.records;
    } finally {
      await session.close();
    }
  }

  ngOnDestroy() {
    this.driver.close();
  }
}
