"use client"

import type React from "react"

import { useState, useCallback, useRef, useMemo } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type Node,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { X, Mail, Phone, Award as IdCard, User } from "lucide-react"
import CustomEdge from "./custom-edge"
import { ProcessNode } from "./nodes/process-node"
import { generateNodeId, createNode } from "@/lib/workflow-utils"

const nodeTypes: NodeTypes = {
  process: ProcessNode,
}

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
}

const initialNodes: Node[] = [
  {
    id: "ceo-1",
    type: "process",
    position: { x: 5250, y: 0 },
    data: {
      label: "Directrice Générale",
      description: "Marie Dubois",
      department: "Direction Générale",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 67 89",
      email: "marie.dubois@entreprise.fr",
      matricule: "EMP-2015-001",
      manager: "Conseil d'Administration",
    },
  },
  {
    id: "cto-1",
    type: "process",
    position: { x: 4425, y: 500 },
    data: {
      label: "Directeur Technique",
      description: "Jean Martin",
      department: "Direction Informatique",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 67 90",
      email: "jean.martin@entreprise.fr",
      matricule: "EMP-2016-002",
      manager: "Marie Dubois",
    },
  },
  {
    id: "cfo-1",
    type: "process",
    position: { x: 4975, y: 500 },
    data: {
      label: "Directrice Financière",
      description: "Sophie Laurent",
      department: "Direction Administration",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 67 91",
      email: "sophie.laurent@entreprise.fr",
      matricule: "EMP-2017-003",
      manager: "Marie Dubois",
    },
  },
  {
    id: "cmo-1",
    type: "process",
    position: { x: 5525, y: 500 },
    data: {
      label: "Directeur Marketing",
      description: "Pierre Rousseau",
      department: "Direction Marketing",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 67 92",
      email: "pierre.rousseau@entreprise.fr",
      matricule: "EMP-2018-004",
      manager: "Marie Dubois",
    },
  },
  {
    id: "hr-1",
    type: "process",
    position: { x: 6075, y: 500 },
    data: {
      label: "Directrice des Ressources Humaines",
      description: "Isabelle Moreau",
      department: "Direction RH",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 67 93",
      email: "isabelle.moreau@entreprise.fr",
      matricule: "EMP-2019-005",
      manager: "Marie Dubois",
    },
  },
  {
    id: "infra-lead-1",
    type: "process",
    position: { x: 4350, y: 1000 },
    data: {
      label: "Chef d'équipe Infrastructure",
      description: "David Mercier",
      department: "Direction Informatique",
      photo: "/labo.jpg",
      phone: "+33 1 23 45 68 20",
      email: "david.mercier@entreprise.fr",
      matricule: "EMP-2020-022",
      manager: "Jean Martin",
    },
  },
  {
    id: "dev-lead-1",
    type: "process",
    position: { x: 3750, y: 1000 },
    data: {
      label: "Chef d'équipe Développement",
      description: "Thomas Bernard",
      department: "Direction Informatique",
      photo: "/labo.jpg",
      phone: "+33 1 23 45 67 94",
      email: "thomas.bernard@entreprise.fr",
      matricule: "EMP-2019-006",
      manager: "Jean Martin",
    },
  },
  {
    id: "qa-lead-1",
    type: "process",
    position: { x: 4050, y: 1000 },
    data: {
      label: "Chef d'équipe Qualité",
      description: "Emma Petit",
      department: "Direction Informatique",
      photo: "/labo.jpg",
      phone: "+33 1 23 45 67 95",
      email: "emma.petit@entreprise.fr",
      matricule: "EMP-2020-007",
      manager: "Jean Martin",
    },
  },
  {
    id: "treasury-1",
    type: "process",
    position: { x: 4950, y: 1000 },
    data: {
      label: "Responsable Trésorerie",
      description: "François Dubois",
      department: "Direction Administration",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 21",
      email: "francois.dubois@entreprise.fr",
      matricule: "EMP-2019-023",
      manager: "Sophie Laurent",
    },
  },
  {
    id: "accountant-1",
    type: "process",
    position: { x: 4650, y: 1000 },
    data: {
      label: "Comptable Senior",
      description: "Lucas Moreau",
      department: "Direction Administration",
      photo: "/professional-man-senior-accountant-portrait.jpg",
      phone: "+33 1 23 45 67 96",
      email: "lucas.moreau@entreprise.fr",
      matricule: "EMP-2018-008",
      manager: "Sophie Laurent",
    },
  },
  {
    id: "controller-1",
    type: "process",
    position: { x: 5250, y: 1000 },
    data: {
      label: "Contrôleur de Gestion",
      description: "Valérie Simon",
      department: "Direction Administration",
      photo: "/securite.png",
      phone: "+33 1 23 45 68 22",
      email: "valerie.simon@entreprise.fr",
      matricule: "EMP-2020-024",
      manager: "Sophie Laurent",
    },
  },
  {
    id: "marketing-1",
    type: "process",
    position: { x: 5550, y: 1000 },
    data: {
      label: "Responsable Digital",
      description: "Julie Simon",
      department: "Direction Marketing",
      photo: "/photo_profil.png",
      phone: "+33 1 23 45 67 97",
      email: "julie.simon@entreprise.fr",
      matricule: "EMP-2021-009",
      manager: "Pierre Rousseau",
    },
  },
  {
    id: "sales-1",
    type: "process",
    position: { x: 5850, y: 1000 },
    data: {
      label: "Responsable Commercial",
      description: "Marc Lefebvre",
      department: "Direction Marketing",
      photo: "/photo_profil.png",
      phone: "+33 1 23 45 67 98",
      email: "marc.lefebvre@entreprise.fr",
      matricule: "EMP-2020-010",
      manager: "Pierre Rousseau",
    },
  },
  {
    id: "brand-1",
    type: "process",
    position: { x: 6150, y: 1000 },
    data: {
      label: "Responsable Communication",
      description: "Céline Garnier",
      department: "Direction Marketing",
      photo: "/photo_profil.png",
      phone: "+33 1 23 45 68 23",
      email: "celine.garnier@entreprise.fr",
      matricule: "EMP-2021-025",
      manager: "Pierre Rousseau",
    },
  },
  {
    id: "hr-manager-1",
    type: "process",
    position: { x: 6450, y: 1000 },
    data: {
      label: "Responsable Recrutement",
      description: "Camille Dubois",
      department: "Direction RH",
      photo: "/photo_profil.png",
      phone: "+33 1 23 45 67 99",
      email: "camille.dubois@entreprise.fr",
      matricule: "EMP-2021-011",
      manager: "Isabelle Moreau",
    },
  },
  {
    id: "training-1",
    type: "process",
    position: { x: 6750, y: 1000 },
    data: {
      label: "Responsable Formation",
      description: "Olivier Blanc",
      department: "Direction RH",
      photo: "/photo_profil.png",
      phone: "+33 1 23 45 68 24",
      email: "olivier.blanc@entreprise.fr",
      matricule: "EMP-2020-026",
      manager: "Isabelle Moreau",
    },
  },
  {
    id: "payroll-1",
    type: "process",
    position: { x: 7050, y: 1000 },
    data: {
      label: "Responsable Paie",
      description: "Martine Leroy",
      department: "Direction RH",
      photo: "/photo_profil.png",
      phone: "+33 1 23 45 68 25",
      email: "martine.leroy@entreprise.fr",
      matricule: "EMP-2019-027",
      manager: "Isabelle Moreau",
    },
  },
  {
    id: "dev-1",
    type: "process",
    position: { x: 3600, y: 1500 },
    data: {
      label: "Développeuse Full Stack",
      description: "Alice Durand",
      department: "Direction Informatique",
      photo: "/saria-avatar.png",
      phone: "+33 1 23 45 68 00",
      email: "alice.durand@entreprise.fr",
      matricule: "EMP-2021-012",
      manager: "Thomas Bernard",
    },
  },
  {
    id: "dev-2",
    type: "process",
    position: { x: 3900, y: 1500 },
    data: {
      label: "Développeur Backend",
      description: "Marc Petit",
      department: "Direction Informatique",
      photo: "/saria-avatar.png",
      phone: "+33 1 23 45 68 01",
      email: "marc.petit@entreprise.fr",
      matricule: "EMP-2021-013",
      manager: "Thomas Bernard",
    },
  },
  {
    id: "dev-3",
    type: "process",
    position: { x: 4200, y: 1500 },
    data: {
      label: "Développeur Frontend",
      description: "Léa Fontaine",
      department: "Direction Informatique",
      photo: "/saria-avatar.png",
      phone: "+33 1 23 45 68 26",
      email: "lea.fontaine@entreprise.fr",
      matricule: "EMP-2022-028",
      manager: "Thomas Bernard",
    },
  },
  {
    id: "qa-1",
    type: "process",
    position: { x: 4500, y: 1500 },
    data: {
      label: "Testeur QA",
      description: "Paul Girard",
      department: "Direction Informatique",
      photo: "/saria-avatar.png",
      phone: "+33 1 23 45 68 02",
      email: "paul.girard@entreprise.fr",
      matricule: "EMP-2022-014",
      manager: "Emma Petit",
    },
  },
  {
    id: "qa-2",
    type: "process",
    position: { x: 4800, y: 1500 },
    data: {
      label: "Testeuse Automatisation",
      description: "Emma Rousseau",
      department: "Direction Informatique",
      photo: "/saria-avatar.png",
      phone: "+33 1 23 45 68 03",
      email: "emma.rousseau@entreprise.fr",
      matricule: "EMP-2022-015",
      manager: "Emma Petit",
    },
  },
  {
    id: "qa-3",
    type: "process",
    position: { x: 5100, y: 1500 },
    data: {
      label: "Testeur Performance",
      description: "Hugo Bertrand",
      department: "Direction Informatique",
      photo: "/saria-avatar.png",
      phone: "+33 1 23 45 68 27",
      email: "hugo.bertrand@entreprise.fr",
      matricule: "EMP-2023-029",
      manager: "Emma Petit",
    },
  },
  {
    id: "infra-1",
    type: "process",
    position: { x: 5400, y: 1500 },
    data: {
      label: "Ingénieur DevOps",
      description: "Nicolas Roux",
      department: "Direction Informatique",
      photo: "/labo.jpg",
      phone: "+33 1 23 45 68 28",
      email: "nicolas.roux@entreprise.fr",
      matricule: "EMP-2021-030",
      manager: "David Mercier",
    },
  },
  {
    id: "infra-2",
    type: "process",
    position: { x: 5700, y: 1500 },
    data: {
      label: "Administrateur Système",
      description: "Stéphane Morel",
      department: "Direction Informatique",
      photo: "/labo.jpg",
      phone: "+33 1 23 45 68 29",
      email: "stephane.morel@entreprise.fr",
      matricule: "EMP-2022-031",
      manager: "David Mercier",
    },
  },
  {
    id: "infra-3",
    type: "process",
    position: { x: 6000, y: 1500 },
    data: {
      label: "Ingénieur Sécurité",
      description: "Patricia Lemoine",
      department: "Direction Informatique",
      photo: "/securite.png",
      phone: "+33 1 23 45 68 30",
      email: "patricia.lemoine@entreprise.fr",
      matricule: "EMP-2021-032",
      manager: "David Mercier",
    },
  },
  {
    id: "analyst-1",
    type: "process",
    position: { x: 6300, y: 1500 },
    data: {
      label: "Analyste Financier",
      description: "Antoine Leroy",
      department: "Direction Administration",
      photo: "/professional-man-financial-analyst-portrait.jpg",
      phone: "+33 1 23 45 68 04",
      email: "antoine.leroy@entreprise.fr",
      matricule: "EMP-2022-016",
      manager: "Lucas Moreau",
    },
  },
  {
    id: "accountant-2",
    type: "process",
    position: { x: 6600, y: 1500 },
    data: {
      label: "Comptable Junior",
      description: "Sophie Girard",
      department: "Direction Administration",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 31",
      email: "sophie.girard@entreprise.fr",
      matricule: "EMP-2023-033",
      manager: "Lucas Moreau",
    },
  },
  {
    id: "accountant-3",
    type: "process",
    position: { x: 6900, y: 1500 },
    data: {
      label: "Assistant Comptable",
      description: "Julien Mercier",
      department: "Direction Administration",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 32",
      email: "julien.mercier@entreprise.fr",
      matricule: "EMP-2023-034",
      manager: "Lucas Moreau",
    },
  },
  {
    id: "treasury-analyst-1",
    type: "process",
    position: { x: 7200, y: 1500 },
    data: {
      label: "Analyste Trésorerie",
      description: "Caroline Dubois",
      department: "Direction Administration",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 33",
      email: "caroline.dubois@entreprise.fr",
      matricule: "EMP-2022-035",
      manager: "François Dubois",
    },
  },
  {
    id: "treasury-analyst-2",
    type: "process",
    position: { x: 7500, y: 1500 },
    data: {
      label: "Gestionnaire Trésorerie",
      description: "Benjamin Laurent",
      department: "Direction Administration",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 34",
      email: "benjamin.laurent@entreprise.fr",
      matricule: "EMP-2023-036",
      manager: "François Dubois",
    },
  },
  {
    id: "treasury-analyst-3",
    type: "process",
    position: { x: 7800, y: 1500 },
    data: {
      label: "Assistant Trésorerie",
      description: "Amélie Rousseau",
      department: "Direction Administration",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 35",
      email: "amelie.rousseau@entreprise.fr",
      matricule: "EMP-2023-037",
      manager: "François Dubois",
    },
  },
  {
    id: "controller-analyst-1",
    type: "process",
    position: { x: 8100, y: 1500 },
    data: {
      label: "Contrôleur Junior",
      description: "Maxime Petit",
      department: "Direction Administration",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 36",
      email: "maxime.petit@entreprise.fr",
      matricule: "EMP-2022-038",
      manager: "Valérie Simon",
    },
  },
  {
    id: "controller-analyst-2",
    type: "process",
    position: { x: 8400, y: 1500 },
    data: {
      label: "Analyste Budgétaire",
      description: "Laura Martin",
      department: "Direction Administration",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 37",
      email: "laura.martin@entreprise.fr",
      matricule: "EMP-2023-039",
      manager: "Valérie Simon",
    },
  },
  {
    id: "controller-analyst-3",
    type: "process",
    position: { x: 8700, y: 1500 },
    data: {
      label: "Assistant Contrôle",
      description: "Thomas Blanc",
      department: "Direction Administration",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 38",
      email: "thomas.blanc@entreprise.fr",
      matricule: "EMP-2023-040",
      manager: "Valérie Simon",
    },
  },
  {
    id: "content-1",
    type: "process",
    position: { x: 9000, y: 1500 },
    data: {
      label: "Responsable Contenu",
      description: "Claire Martin",
      department: "Direction Marketing",
      photo: "/professional-woman-content-manager-portrait.jpg",
      phone: "+33 1 23 45 68 05",
      email: "claire.martin@entreprise.fr",
      matricule: "EMP-2022-017",
      manager: "Julie Simon",
    },
  },
  {
    id: "social-1",
    type: "process",
    position: { x: 9300, y: 1500 },
    data: {
      label: "Community Manager",
      description: "Julien Blanc",
      department: "Direction Marketing",
      photo: "/professional-man-social-media-community-manager-po.jpg",
      phone: "+33 1 23 45 68 06",
      email: "julien.blanc@entreprise.fr",
      matricule: "EMP-2022-018",
      manager: "Julie Simon",
    },
  },
  {
    id: "seo-1",
    type: "process",
    position: { x: 9600, y: 1500 },
    data: {
      label: "Spécialiste SEO",
      description: "Anaïs Durand",
      department: "Direction Marketing",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 39",
      email: "anais.durand@entreprise.fr",
      matricule: "EMP-2023-041",
      manager: "Julie Simon",
    },
  },
  {
    id: "sales-rep-1",
    type: "process",
    position: { x: 9900, y: 1500 },
    data: {
      label: "Commercial Senior",
      description: "Nathalie Roux",
      department: "Direction Marketing",
      photo: "/professional-woman-senior-sales-representative-por.jpg",
      phone: "+33 1 23 45 68 07",
      email: "nathalie.roux@entreprise.fr",
      matricule: "EMP-2021-019",
      manager: "Marc Lefebvre",
    },
  },
  {
    id: "sales-rep-2",
    type: "process",
    position: { x: 10200, y: 1500 },
    data: {
      label: "Commercial Junior",
      description: "Kevin Dupont",
      department: "Direction Marketing",
      photo: "/professional-man-junior-sales-representative-portr.jpg",
      phone: "+33 1 23 45 68 08",
      email: "kevin.dupont@entreprise.fr",
      matricule: "EMP-2023-020",
      manager: "Marc Lefebvre",
    },
  },
  {
    id: "sales-rep-3",
    type: "process",
    position: { x: 10500, y: 1500 },
    data: {
      label: "Chargé d'Affaires",
      description: "Sandrine Moreau",
      department: "Direction Marketing",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 40",
      email: "sandrine.moreau@entreprise.fr",
      matricule: "EMP-2022-042",
      manager: "Marc Lefebvre",
    },
  },
  {
    id: "brand-designer-1",
    type: "process",
    position: { x: 10800, y: 1500 },
    data: {
      label: "Designer Graphique",
      description: "Alexandre Simon",
      department: "Direction Marketing",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 41",
      email: "alexandre.simon@entreprise.fr",
      matricule: "EMP-2022-043",
      manager: "Céline Garnier",
    },
  },
  {
    id: "brand-designer-2",
    type: "process",
    position: { x: 11100, y: 1500 },
    data: {
      label: "Chargé de Communication",
      description: "Émilie Lefebvre",
      department: "Direction Marketing",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 42",
      email: "emilie.lefebvre@entreprise.fr",
      matricule: "EMP-2023-044",
      manager: "Céline Garnier",
    },
  },
  {
    id: "brand-designer-3",
    type: "process",
    position: { x: 11400, y: 1500 },
    data: {
      label: "Responsable Relations Presse",
      description: "Vincent Garnier",
      department: "Direction Marketing",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 43",
      email: "vincent.garnier@entreprise.fr",
      matricule: "EMP-2022-045",
      manager: "Céline Garnier",
    },
  },
  {
    id: "hr-coord-1",
    type: "process",
    position: { x: 11700, y: 1500 },
    data: {
      label: "Coordinateur RH",
      description: "Sarah Lambert",
      department: "Direction RH",
      photo: "/professional-woman-hr-coordinator-portrait.jpg",
      phone: "+33 1 23 45 68 09",
      email: "sarah.lambert@entreprise.fr",
      matricule: "EMP-2023-021",
      manager: "Camille Dubois",
    },
  },
  {
    id: "recruiter-1",
    type: "process",
    position: { x: 12000, y: 1500 },
    data: {
      label: "Chargé de Recrutement",
      description: "Fabien Moreau",
      department: "Direction RH",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 44",
      email: "fabien.moreau@entreprise.fr",
      matricule: "EMP-2023-046",
      manager: "Camille Dubois",
    },
  },
  {
    id: "recruiter-2",
    type: "process",
    position: { x: 12300, y: 1500 },
    data: {
      label: "Assistant Recrutement",
      description: "Manon Petit",
      department: "Direction RH",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 45",
      email: "manon.petit@entreprise.fr",
      matricule: "EMP-2023-047",
      manager: "Camille Dubois",
    },
  },
  {
    id: "trainer-1",
    type: "process",
    position: { x: 12600, y: 1500 },
    data: {
      label: "Formateur Senior",
      description: "Philippe Durand",
      department: "Direction RH",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 46",
      email: "philippe.durand@entreprise.fr",
      matricule: "EMP-2021-048",
      manager: "Olivier Blanc",
    },
  },
  {
    id: "trainer-2",
    type: "process",
    position: { x: 12900, y: 1500 },
    data: {
      label: "Coordinateur Formation",
      description: "Isabelle Rousseau",
      department: "Direction RH",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 47",
      email: "isabelle.rousseau@entreprise.fr",
      matricule: "EMP-2022-049",
      manager: "Olivier Blanc",
    },
  },
  {
    id: "trainer-3",
    type: "process",
    position: { x: 13200, y: 1500 },
    data: {
      label: "Assistant Formation",
      description: "Christophe Martin",
      department: "Direction RH",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 48",
      email: "christophe.martin@entreprise.fr",
      matricule: "EMP-2023-050",
      manager: "Olivier Blanc",
    },
  },
  {
    id: "payroll-specialist-1",
    type: "process",
    position: { x: 13500, y: 1500 },
    data: {
      label: "Gestionnaire Paie",
      description: "Sylvie Blanc",
      department: "Direction RH",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 49",
      email: "sylvie.blanc@entreprise.fr",
      matricule: "EMP-2021-051",
      manager: "Martine Leroy",
    },
  },
  {
    id: "payroll-specialist-2",
    type: "process",
    position: { x: 13800, y: 1500 },
    data: {
      label: "Technicien Paie",
      description: "Grégory Lefebvre",
      department: "Direction RH",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 50",
      email: "gregory.lefebvre@entreprise.fr",
      matricule: "EMP-2022-052",
      manager: "Martine Leroy",
    },
  },
  {
    id: "payroll-specialist-3",
    type: "process",
    position: { x: 14100, y: 1500 },
    data: {
      label: "Assistant Paie",
      description: "Aurélie Garnier",
      department: "Direction RH",
      photo: "/directeur.jpg",
      phone: "+33 1 23 45 68 51",
      email: "aurelie.garnier@entreprise.fr",
      matricule: "EMP-2023-053",
      manager: "Martine Leroy",
    },
  },
]

const initialEdges: Edge[] = [
  { id: "e-ceo-cto", source: "ceo-1", target: "cto-1", type: "custom" },
  { id: "e-ceo-cfo", source: "ceo-1", target: "cfo-1", type: "custom" },
  { id: "e-ceo-cmo", source: "ceo-1", target: "cmo-1", type: "custom" },
  { id: "e-ceo-hr", source: "ceo-1", target: "hr-1", type: "custom" },

  { id: "e-cto-dev", source: "cto-1", target: "dev-lead-1", type: "custom" },
  { id: "e-cto-qa", source: "cto-1", target: "qa-lead-1", type: "custom" },
  { id: "e-cto-infra", source: "cto-1", target: "infra-lead-1", type: "custom" },

  { id: "e-cfo-acc", source: "cfo-1", target: "accountant-1", type: "custom" },
  { id: "e-cfo-treasury", source: "cfo-1", target: "treasury-1", type: "custom" },
  { id: "e-cfo-controller", source: "cfo-1", target: "controller-1", type: "custom" },

  { id: "e-cmo-marketing", source: "cmo-1", target: "marketing-1", type: "custom" },
  { id: "e-cmo-sales", source: "cmo-1", target: "sales-1", type: "custom" },
  { id: "e-cmo-brand", source: "cmo-1", target: "brand-1", type: "custom" },

  { id: "e-hr-manager", source: "hr-1", target: "hr-manager-1", type: "custom" },
  { id: "e-hr-training", source: "hr-1", target: "training-1", type: "custom" },
  { id: "e-hr-payroll", source: "hr-1", target: "payroll-1", type: "custom" },

  { id: "e-devlead-dev1", source: "dev-lead-1", target: "dev-1", type: "custom" },
  { id: "e-devlead-dev2", source: "dev-lead-1", target: "dev-2", type: "custom" },
  { id: "e-devlead-dev3", source: "dev-lead-1", target: "dev-3", type: "custom" },

  { id: "e-qalead-qa1", source: "qa-lead-1", target: "qa-1", type: "custom" },
  { id: "e-qalead-qa2", source: "qa-lead-1", target: "qa-2", type: "custom" },
  { id: "e-qalead-qa3", source: "qa-lead-1", target: "qa-3", type: "custom" },

  { id: "e-infralead-infra1", source: "infra-lead-1", target: "infra-1", type: "custom" },
  { id: "e-infralead-infra2", source: "infra-lead-1", target: "infra-2", type: "custom" },
  { id: "e-infralead-infra3", source: "infra-lead-1", target: "infra-3", type: "custom" },

  { id: "e-acc-analyst", source: "accountant-1", target: "analyst-1", type: "custom" },
  { id: "e-acc-accountant2", source: "accountant-1", target: "accountant-2", type: "custom" },
  { id: "e-acc-accountant3", source: "accountant-1", target: "accountant-3", type: "custom" },

  { id: "e-treasury-analyst1", source: "treasury-1", target: "treasury-analyst-1", type: "custom" },
  { id: "e-treasury-analyst2", source: "treasury-1", target: "treasury-analyst-2", type: "custom" },
  { id: "e-treasury-analyst3", source: "treasury-1", target: "treasury-analyst-3", type: "custom" },

  { id: "e-controller-analyst1", source: "controller-1", target: "controller-analyst-1", type: "custom" },
  { id: "e-controller-analyst2", source: "controller-1", target: "controller-analyst-2", type: "custom" },
  { id: "e-controller-analyst3", source: "controller-1", target: "controller-analyst-3", type: "custom" },

  { id: "e-marketing-content", source: "marketing-1", target: "content-1", type: "custom" },
  { id: "e-marketing-social", source: "marketing-1", target: "social-1", type: "custom" },
  { id: "e-marketing-seo", source: "marketing-1", target: "seo-1", type: "custom" },

  { id: "e-sales-rep1", source: "sales-1", target: "sales-rep-1", type: "custom" },
  { id: "e-sales-rep2", source: "sales-1", target: "sales-rep-2", type: "custom" },
  { id: "e-sales-rep3", source: "sales-1", target: "sales-rep-3", type: "custom" },

  { id: "e-brand-designer1", source: "brand-1", target: "brand-designer-1", type: "custom" },
  { id: "e-brand-designer2", source: "brand-1", target: "brand-designer-2", type: "custom" },
  { id: "e-brand-designer3", source: "brand-1", target: "brand-designer-3", type: "custom" },

  { id: "e-hr-coord", source: "hr-manager-1", target: "hr-coord-1", type: "custom" },
  { id: "e-hr-recruiter1", source: "hr-manager-1", target: "recruiter-1", type: "custom" },
  { id: "e-hr-recruiter2", source: "hr-manager-1", target: "recruiter-2", type: "custom" },

  { id: "e-training-trainer1", source: "training-1", target: "trainer-1", type: "custom" },
  { id: "e-training-trainer2", source: "training-1", target: "trainer-2", type: "custom" },
  { id: "e-training-trainer3", source: "training-1", target: "trainer-3", type: "custom" },

  { id: "e-payroll-specialist1", source: "payroll-1", target: "payroll-specialist-1", type: "custom" },
  { id: "e-payroll-specialist2", source: "payroll-1", target: "payroll-specialist-2", type: "custom" },
  { id: "e-payroll-specialist3", source: "payroll-1", target: "payroll-specialist-3", type: "custom" },
]

export default function WorkflowBuilder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, type: "custom" }, eds)),
    [setEdges],
  )

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      const type = event.dataTransfer.getData("application/reactflow")

      if (typeof type === "undefined" || !type) {
        return
      }

      if (reactFlowBounds && reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        })

        const newNode = createNode({
          type,
          position,
          id: generateNodeId(type),
        })

        setNodes((nds) => nds.concat(newNode))
      }
    },
    [reactFlowInstance, setNodes],
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const updateNodeData = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  const findPathToCEO = useCallback((nodeId: string, edges: Edge[]): { edgeIds: string[]; nodeIds: string[] } => {
    const edgeIds: string[] = []
    const nodeIds: string[] = [nodeId] // Include the hovered node itself
    let currentNodeId = nodeId
    const ceoId = "ceo-1"

    // Prevent infinite loops
    const visited = new Set<string>()

    while (currentNodeId !== ceoId && !visited.has(currentNodeId)) {
      visited.add(currentNodeId)

      // Find the edge where current node is the target
      const parentEdge = edges.find((edge) => edge.target === currentNodeId)

      if (!parentEdge) break

      edgeIds.push(parentEdge.id)
      currentNodeId = parentEdge.source
      nodeIds.push(currentNodeId) // Add parent node to the path
    }

    return { edgeIds, nodeIds }
  }, [])

  const highlightedPath = useMemo(() => {
    if (!hoveredNodeId) return { edgeIds: new Set<string>(), nodeIds: new Set<string>() }
    const path = findPathToCEO(hoveredNodeId, edges)
    return {
      edgeIds: new Set(path.edgeIds),
      nodeIds: new Set(path.nodeIds),
    }
  }, [hoveredNodeId, edges, findPathToCEO])

  const edgesWithHighlight = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      data: {
        ...edge.data,
        isHighlighted: highlightedPath.edgeIds.has(edge.id),
      },
    }))
  }, [edges, highlightedPath.edgeIds])

  const nodesWithHoverHandler = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onMouseEnter: () => setHoveredNodeId(node.id),
        onMouseLeave: () => setHoveredNodeId(null),
        isHighlighted: highlightedPath.nodeIds.has(node.id),
      },
    }))
  }, [nodes, highlightedPath.nodeIds])

  return (
    <div className="flex h-screen relative">
      <div className="flex-1 flex flex-col">
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodesWithHoverHandler}
              edges={edgesWithHighlight}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              snapToGrid
              snapGrid={[15, 15]}
              defaultEdgeOptions={{ type: "custom" }}
              defaultViewport={{ x: 0, y: 0, zoom: 0.45 }}
            >
              <Background />
              <Controls 
                position="top-left"
                style={{
                  top: '20px',
                  left: '20px',
                  zIndex: 10
                }}
              />
              <MiniMap 
                position="top-right"
                style={{
                  top: '20px',
                  right: '20px',
                  zIndex: 10
                }}
              />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      {selectedNode && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Section with Photo */}
            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 px-8 pt-12 pb-8">
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/80 rounded-full transition-all duration-200 group"
              >
                <X className="h-5 w-5 text-slate-600 group-hover:text-slate-900" />
              </button>

              {/* Photo and Basic Info */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-xl">
                    <img
                      src={selectedNode.data.photo || "/placeholder.svg?height=150&width=150"}
                      alt={selectedNode.data.description}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                  {selectedNode.data.description}
                </h2>
                <p className="text-lg text-slate-600 mb-3 font-medium">{selectedNode.data.label}</p>
                <span className="inline-flex items-center px-4 py-1.5 bg-white text-slate-700 text-sm font-medium rounded-full shadow-sm border border-slate-200">
                  {selectedNode.data.department}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-8 py-8 overflow-y-auto max-h-[calc(85vh-280px)]">
              {/* Contact Information */}
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span>Contact</span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <a
                    href={`mailto:${selectedNode.data.email}`}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-0.5">Email</p>
                      <p className="text-sm font-medium text-slate-900 truncate">{selectedNode.data.email}</p>
                    </div>
                  </a>

                  <div className="grid grid-cols-2 gap-4">
                    <a
                      href={`tel:${selectedNode.data.phone}`}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-0.5">Mobile</p>
                        <p className="text-sm font-medium text-slate-900">{selectedNode.data.phone}</p>
                      </div>
                    </a>

                    <a
                      href={`tel:${selectedNode.data.office_phone || selectedNode.data.phone_fixe}`}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                        <Phone className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-0.5">Fixe</p>
                        <p className="text-sm font-medium text-slate-900">{selectedNode.data.office_phone || selectedNode.data.phone_fixe || "Non renseigné"}</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span>Informations Professionnelles</span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <IdCard className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-0.5">Matricule</p>
                      <p className="text-sm font-medium text-slate-900">{selectedNode.data.matricule}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                      <User className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-0.5">Manager</p>
                      <p className="text-sm font-medium text-slate-900">{selectedNode.data.manager}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
