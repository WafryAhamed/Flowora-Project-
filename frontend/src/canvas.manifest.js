export const manifest = {
  screens: {
    scr_bont0h: { name: "Login", route: "/login", position: { "x": 160, "y": 220 } },
    scr_jeu0t8: { name: "Register", route: "/register", position: { "x": 1560, "y": 220 } },
    scr_vbtvzb: { name: "Dashboard", route: "/", position: { "x": 160, "y": 2200 } },
    scr_y0sj69: { name: "Weekly Reports", route: "/reports", position: { "x": 160, "y": 4180 } },
    scr_9yuq4g: { name: "Projects", route: "/projects", position: { "x": 1560, "y": 4180 } },
    scr_e6hgn4: { name: "Analytics", route: "/analytics", position: { "x": 2960, "y": 4180 } },
    scr_lvosj8: { name: "AI Assistant", route: "/ai", position: { "x": 4360, "y": 4180 } },
    scr_y9nptg: { name: "Users", route: "/users", position: { "x": 160, "y": 6160 } },
    scr_el277q: { name: "Settings", route: "/settings", position: { "x": 1560, "y": 6160 } }
  },
  sections: {
    sec_gvlt9p: { name: "Authentication", x: 0, y: 0, width: 2920, height: 1180 },
    sec_byt5pw: { name: "Main Dashboard", x: 0, y: 1980, width: 1520, height: 1180 },
    sec_95tj8u: { name: "Analytics & Insights", x: 0, y: 3960, width: 5720, height: 1180 },
    sec_yqxob8: { name: "Administration", x: 0, y: 5940, width: 2920, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_gvlt9p", children: [
    { kind: "screen", id: "scr_bont0h" },
    { kind: "screen", id: "scr_jeu0t8" }]
  },
  { kind: "section", id: "sec_byt5pw", children: [
    { kind: "screen", id: "scr_vbtvzb" }]
  },
  { kind: "section", id: "sec_95tj8u", children: [
    { kind: "screen", id: "scr_y0sj69" },
    { kind: "screen", id: "scr_9yuq4g" },
    { kind: "screen", id: "scr_e6hgn4" },
    { kind: "screen", id: "scr_lvosj8" }]
  },
  { kind: "section", id: "sec_yqxob8", children: [
    { kind: "screen", id: "scr_y9nptg" },
    { kind: "screen", id: "scr_el277q" }]
  }]

};