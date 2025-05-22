export const treeGraphData = {
  nodes: [
    { id: "kgtu", name: "КГТУ", group: 0, color: "#0000ff", x: 0, y: 0 },

    { id: "cat_Тест", name: "Тест", group: 1, color: "#ff69b4", x: -300, y: 150 },
    { id: "cat_Юмор", name: "Юмор", group: 1, color: "#ff69b4", x: -100, y: 150 },
    { id: "cat_Науки", name: "Науки", group: 1, color: "#ff69b4", x: 100, y: 150 },
    { id: "cat_IT", name: "IT", group: 1, color: "#ff69b4", x: 300, y: 150 },

    { id: "sub_Театр", name: "Театр", group: 2, color: "#00ced1", x: -400, y: 300 },
    { id: "sub_Графы", name: "Графы", group: 2, color: "#00ced1", x: -200, y: 300 },
    { id: "sub_Математика", name: "Математика", group: 2, color: "#00ced1", x: -450, y: 400 },
    { id: "sub_История", name: "История", group: 2, color: "#00ced1", x: -150, y: 400 },

    { id: "sub_КВН", name: "КВН", group: 2, color: "#ff1744", x: -100, y: 300 },
    { id: "sub_Танцы", name: "Танцы", group: 2, color: "#ff1744", x: 0, y: 300 },

    { id: "sub_ЧГК", name: "ЧГК", group: 2, color: "#43ea4c", x: 50, y: 300 },
    { id: "sub_Химия", name: "Химия", group: 2, color: "#43ea4c", x: 100, y: 300 },
    { id: "sub_БИО", name: "БИО", group: 2, color: "#43ea4c", x: 150, y: 300 },

    { id: "sub_Веб", name: "Веб", group: 2, color: "#2196f3", x: 250, y: 300 },
    { id: "sub_ЯП", name: "ЯП", group: 2, color: "#2196f3", x: 350, y: 300 }
  ],
  links: [
    { source: "kgtu", target: "cat_Тест" },
    { source: "kgtu", target: "cat_Юмор" },
    { source: "kgtu", target: "cat_Науки" },
    { source: "kgtu", target: "cat_IT" },

    { source: "cat_Тест", target: "sub_Театр" },
    { source: "cat_Тест", target: "sub_Графы" },
    { source: "sub_Театр", target: "sub_Математика" },
    { source: "sub_Графы", target: "sub_История" },

    { source: "cat_Юмор", target: "sub_КВН" },
    { source: "cat_Юмор", target: "sub_Танцы" },

    { source: "cat_Науки", target: "sub_ЧГК" },
    { source: "cat_Науки", target: "sub_Химия" },
    { source: "cat_Науки", target: "sub_БИО" },

    { source: "cat_IT", target: "sub_Веб" },
    { source: "cat_IT", target: "sub_ЯП" }
  ]
}; 