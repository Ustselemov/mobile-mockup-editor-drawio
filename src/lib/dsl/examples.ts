export const dslExampleSources = [
  {
    id: "product-page",
    label: "Product page",
    source: `project name:"Product page"
screen ProductPage preset:iphone15
  section Hero layout:vstack gap:12
    badge text:"Verified" variant:success
    text value:"Sony XM5"
    button variant:primary text:"Buy now" width:240 height:44
  section Details layout:vstack gap:8
    field label:"Color" value:"Black"
    checkbox text:"Include warranty" checked:true
`,
  },
  {
    id: "checkout",
    label: "Checkout",
    source: `project name:"Checkout flow"
screen Checkout preset:iphone15
  section Address layout:vstack gap:8
    field label:"Address" value:"Yekaterinburg"
    field label:"Pickup point" value:"Main st. 24"
  section Actions layout:hstack gap:8
    button variant:secondary text:"Back"
    button variant:primary text:"Continue"
`,
  },
  {
    id: "task-detail",
    label: "Task detail",
    source: `project name:"Task detail"
screen TaskDetail preset:iphone15
  section Task layout:vstack gap:8
    text value:"Prepare release notes"
    badge text:"Urgent" variant:status
    checkbox text:"Done"
`,
  },
] as const;

export function getDefaultDslSource(): string {
  return dslExampleSources[0].source;
}

