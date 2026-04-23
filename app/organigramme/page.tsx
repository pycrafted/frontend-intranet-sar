"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { useRef, useEffect, useState } from "react"

interface OrgNode {
  id: number
  title: string
  name: string
  dept?: string
  isRoot?: boolean
  children?: OrgNode[]
}

const ORG_DATA: OrgNode = {
  id: 1,
  title: "DIRECTEUR GENERAL",
  name: "Mamadou Abib DIOP",
  dept: "Direction Générale",
  isRoot: true,
  children: [
    {
      id: 2,
      title: "RESPONSABLE AMELIORATION CONTINU ET SUIVI PERFORMANCES",
      name: "Ibrahima Mbow",
      dept: "Amelioration Continue & Suivi des Performances",
    },
    {
      id: 3,
      title: "DIRECTEUR CONSEILLER",
      name: "Cheikh Tidiane Mbodj",
      dept: "Contrôle et Performances",
    },
    {
      id: 4,
      title: "RESPONSABLE COMMUNICATION",
      name: "Anta Diack",
      dept: "Departement Communication",
    },
    {
      id: 5,
      title: "CONTROLEUR DE GESTION",
      name: "Abibatou DIANE",
      dept: "Departement Contrôle de Gestion",
    },
    {
      id: 6,
      title: "CHEF DE DEPARTEMENT JURIDIQUE",
      name: "Mamadou Moustapha NDIAYE",
      dept: "Departement Juridique",
    },
    {
      id: 7,
      title: "CONSEILLER DG",
      name: "Papa Moctar Diop",
      dept: "Direction Commerciale",
    },
    {
      id: 8,
      title: "DIRECTEUR EXECUTIF OPERATIONS",
      name: "Daouda Kebe",
      dept: "Direction Executif Opération",
      children: [
        {
          id: 10,
          title: "CHEF SERVICE ACHATS",
          name: "Cheikh Ayah KANE",
          dept: "Departement Achats et Appro",
        },
        {
          id: 11,
          title: "DIRECTRICE MARKETING COMMERCIAL",
          name: "Maimouna Diop Diagne",
          dept: "Ressources et Débouchés",
        },
        {
          id: 12,
          title: "DIRECTEUR TECHNIQUE",
          name: "Ousmane SEMBENE",
          dept: "Sécurité et contrôle",
        },
      ],
    },
    {
      id: 9,
      title: "DIRECTEUR EXECUTIF OPERATIONS",
      name: "Souleymane SECK",
      dept: "Direction Executif Support",
      children: [
        {
          id: 13,
          title: "DIRECTEUR FINANCIER",
          name: "Oumar Yaya Sow",
          dept: "Direction Financière",
        },
        {
          id: 14,
          title: "DIRECTEUR INFORMATIQUE",
          name: "Idrissa Cisse",
          dept: "Informatique",
        },
      ],
    },
    {
      id: 15,
      title: "CONSEILLER DG",
      name: "Oumy Fall",
      dept: "Direction Générale",
    },
  ],
}

/* ── Constantes ── */
const CARD_W = 165   // largeur naturelle d'une carte
const GAP    = 8     // espace entre cartes (chaque côté)
const CONN_H = 38    // hauteur des connecteurs
const LINE   = "#94a3b8"

/* ──────────────────────────────────────────────
   Carte sans avatar — typographie généreuse
   Le scale automatique la ramènera à ~10 px final
────────────────────────────────────────────── */
function OrgCard({ node }: { node: OrgNode }) {
  const isRoot = !!node.isRoot

  return (
    <div
      style={{
        width: CARD_W,
        boxSizing: "border-box",
        padding: "14px 12px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 7,
        textAlign: "center",
        borderRadius: 14,
        border: `2px solid ${isRoot ? "#f59e0b" : "#dde3ee"}`,
        background: isRoot
          ? "linear-gradient(140deg,#fffbeb 0%,#fef3c7 100%)"
          : "#ffffff",
        boxShadow: isRoot
          ? "0 6px 20px rgba(245,158,11,.22)"
          : "0 2px 10px rgba(0,0,0,.08)",
      }}
    >
      {/* Étoile DG */}
      {isRoot && (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#fbbf24,#d97706)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ color: "#fff", fontSize: 16, lineHeight: 1 }}>★</span>
        </div>
      )}

      {/* Intitulé du poste */}
      <p
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 800,
          lineHeight: 1.35,
          color: isRoot ? "#92400e" : "#344256",
          wordBreak: "break-word",
          letterSpacing: "0.01em",
        }}
      >
        {node.title}
      </p>

      {/* Séparateur */}
      <div
        style={{
          width: "75%",
          height: 1,
          background: isRoot ? "#fcd34d" : "#e2e8f0",
          flexShrink: 0,
        }}
      />

      {/* Nom */}
      <p
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: isRoot ? 600 : 400,
          lineHeight: 1.35,
          color: isRoot ? "#b45309" : "#475569",
          wordBreak: "break-word",
        }}
      >
        {node.name}
      </p>

      {/* Badge direction */}
      {node.dept && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            lineHeight: 1.4,
            padding: "3px 9px",
            borderRadius: 99,
            background: isRoot ? "#fde68a" : "#f1f5f9",
            color: isRoot ? "#78350f" : "#475569",
            wordBreak: "break-word",
          }}
        >
          {node.dept}
        </span>
      )}
    </div>
  )
}

/* ── Nœud récursif ── */
function OrgTree({ node }: { node: OrgNode }) {
  const kids = node.children ?? []
  const hasKids = kids.length > 0

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <OrgCard node={node} />

      {hasKids && (
        <>
          {/* Ligne verticale depuis la carte */}
          <div style={{ width: 1, height: CONN_H, background: LINE }} />

          {/* Rangée des enfants */}
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            {kids.map((child, i) => {
              const isFirst  = i === 0
              const isLast   = i === kids.length - 1
              const isOnly   = kids.length === 1
              return (
                <div
                  key={child.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: `0 ${GAP}px`,
                  }}
                >
                  {/* Zone connecteur */}
                  <div style={{ width: "100%", height: CONN_H, position: "relative" }}>
                    {!isOnly && !isFirst && (
                      <div style={{ position: "absolute", top: 0, left: 0, right: "50%", height: 1, background: LINE }} />
                    )}
                    {!isOnly && !isLast && (
                      <div style={{ position: "absolute", top: 0, left: "50%", right: 0, height: 1, background: LINE }} />
                    )}
                    <div style={{
                      position: "absolute", top: 0, bottom: 0,
                      left: "50%", transform: "translateX(-50%)",
                      width: 1, background: LINE,
                    }} />
                  </div>
                  <OrgTree node={child} />
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Conteneur auto-scale centré ── */
function OrganigrammeStatic() {
  const containerRef = useRef<HTMLDivElement>(null)
  const treeRef      = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState<number | null>(null)

  useEffect(() => {
    const compute = () => {
      if (!containerRef.current || !treeRef.current) return
      const cw = containerRef.current.clientWidth
      const ch = containerRef.current.clientHeight
      const tw = treeRef.current.offsetWidth
      const th = treeRef.current.offsetHeight
      if (!tw || !th) return
      const sx = (cw - 48) / tw
      const sy = (ch - 48) / th
      setScale(Math.min(sx, sy, 1))
    }

    // Double rAF : laisse le navigateur calculer le layout complet
    const id = requestAnimationFrame(() => requestAnimationFrame(compute))
    window.addEventListener("resize", compute)
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", compute) }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#f8fafc",
      }}
    >
      {/*
        Centrage correct avec transform :
        left:50% + translateX(-50%) centre l'arbre sur sa taille NATURELLE,
        puis scale() depuis "top center" conserve ce centrage horizontal.
      */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform:
            scale !== null
              ? `translate(-50%, -50%) scale(${scale})`
              : "translate(-50%, -50%)",
          transformOrigin: "center center",
          opacity: scale !== null ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      >
        <div ref={treeRef} style={{ display: "inline-block" }}>
          <OrgTree node={ORG_DATA} />
        </div>
      </div>
    </div>
  )
}

/* ── Flatten tree BFS — niveau par niveau (DG → directeurs → sous-directeurs) ── */
function flattenNodes(root: OrgNode): OrgNode[] {
  const result: OrgNode[] = []
  const queue: OrgNode[] = [root]
  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node)
    if (node.children) queue.push(...node.children)
  }
  return result
}

/* ── Mobile card — même style que OrgCard ── */
function MobileOrgCard({ node }: { node: OrgNode }) {
  const isRoot = !!node.isRoot
  return (
    <div
      style={{
        boxSizing: "border-box",
        padding: "14px 12px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 7,
        textAlign: "center",
        borderRadius: 14,
        border: `2px solid ${isRoot ? "#f59e0b" : "#dde3ee"}`,
        background: isRoot
          ? "linear-gradient(140deg,#fffbeb 0%,#fef3c7 100%)"
          : "#ffffff",
        boxShadow: isRoot
          ? "0 6px 20px rgba(245,158,11,.22)"
          : "0 2px 10px rgba(0,0,0,.08)",
      }}
    >
      {isRoot && (
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#fbbf24,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 16, lineHeight: 1 }}>★</span>
        </div>
      )}
      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, lineHeight: 1.35, color: isRoot ? "#92400e" : "#344256", wordBreak: "break-word", letterSpacing: "0.01em" }}>
        {node.title}
      </p>
      <div style={{ width: "75%", height: 1, background: isRoot ? "#fcd34d" : "#e2e8f0", flexShrink: 0 }} />
      <p style={{ margin: 0, fontSize: 11, fontWeight: isRoot ? 600 : 400, lineHeight: 1.35, color: isRoot ? "#b45309" : "#475569", wordBreak: "break-word" }}>
        {node.name}
      </p>
      {node.dept && (
        <span style={{ fontSize: 10, fontWeight: 500, lineHeight: 1.4, padding: "3px 9px", borderRadius: 99, background: isRoot ? "#fde68a" : "#f1f5f9", color: isRoot ? "#78350f" : "#475569", wordBreak: "break-word" }}>
          {node.dept}
        </span>
      )}
    </div>
  )
}

/* ── Mobile grid view ── */
function MobileOrgView() {
  const nodes = flattenNodes(ORG_DATA)
  return (
    <div className="p-3 pb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full" style={{ backgroundColor: "#344256" }} />
        <h2 className="text-base font-semibold text-gray-900">Organigramme</h2>
        <span
          className="ml-1 text-xs px-2 py-0.5 rounded-full font-medium text-white"
          style={{ backgroundColor: "#344256" }}
        >
          {nodes.length}
        </span>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
        {nodes.map(node => (
          <MobileOrgCard key={node.id} node={node} />
        ))}
      </div>
    </div>
  )
}

export default function OrganigrammePage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <LayoutWrapper
      secondaryNavbarProps={{
        showFilter: true,
        showDepartmentFilter: true,
        departmentFilterStatic: true,
        selectedDepartment: "Direction Générale",
      }}
    >
      {isMobile ? (
        <MobileOrgView />
      ) : (
        <div className="w-full" style={{ height: "calc(100dvh - 9rem)" }}>
          <OrganigrammeStatic />
        </div>
      )}
    </LayoutWrapper>
  )
}
