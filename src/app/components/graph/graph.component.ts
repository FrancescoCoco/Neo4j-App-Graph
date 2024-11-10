import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Neo4jService } from 'src/app/services/neo4j.service';
import { DataSet } from 'vis-data';
import { Network } from 'vis-network';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {
  @ViewChild('graphContainer', { static: true }) graphContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute, // Inietta ActivatedRoute
    private neo4jService: Neo4jService
  ) {}

  async ngOnInit() {
    // Ottieni il parametro "name" dalla rotta
    const name = this.route.snapshot.paramMap.get('name');

    if (name) {
      // Esegui la query con il nome dinamico
      const query = `
        MATCH (a:Person)-[:ACTED_IN]->(m:Movie)<-[:WROTE]-(w:Person)
        WHERE w.name = $name
        RETURN a, w, m
      `;
      const records = await this.neo4jService.runQuery(query, { name });
      this.createGraph(records);
    }
  }

  createGraph(records: any) {
    // Creazione dei nodi e degli archi
    const nodes = new DataSet<any>([]);
    const edges = new DataSet<any>([]);
  
    records.forEach((record: any) => {
      const actor = record.get('a').properties;
      const writer = record.get('w').properties;
      const movie = record.get('m').properties;
  
      // Aggiunta dei nodi (con controllo per evitare duplicati)
      if (!nodes.get(actor.name)) {
        nodes.add({ id: actor.name, label: actor.name, group: 'person' });
      }
      if (!nodes.get(writer.name)) {
        nodes.add({ id: writer.name, label: writer.name, group: 'person' });
      }
      if (!nodes.get(movie.title)) {
        nodes.add({ id: movie.title, label: movie.title, group: 'movie' });
      }
  
      // Aggiunta degli archi (verifica se esistono già per evitare duplicati)
      const actedInEdgeId = `${actor.name}-ACTED_IN-${movie.title}`;
      const wroteEdgeId = `${writer.name}-WROTE-${movie.title}`;
  
      if (!edges.get(actedInEdgeId)) {
        edges.add({ 
          id: actedInEdgeId, 
          from: actor.name, 
          to: movie.title, 
          label: 'ACTED_IN',
          arrows: { to: { enabled: true } } // Freccia che punta verso il film
        });
      }
      if (!edges.get(wroteEdgeId)) {
        edges.add({ 
          id: wroteEdgeId, 
          from: writer.name, 
          to: movie.title, 
          label: 'WROTE',
          arrows: { to: { enabled: true } } // Freccia che punta verso il film
        });
      }
    });
  
    // Debug: Verifica i contenuti di nodes e edges
    console.log('Nodes:', nodes.get());
    console.log('Edges:', edges.get());
  
    // Configurazione della rete di grafo
    const data = { nodes, edges };
    const options = {
      nodes: { shape: 'dot', size: 20 },
      edges: { 
        font: { align: 'top' }, 
        color: '#7d7d7d',
        arrows: { to: { enabled: true, scaleFactor: 1 } } // Configura le frecce sugli archi
      },
      physics: { enabled: true },
    };
  
    new Network(this.graphContainer.nativeElement, data, options);
  }
}
