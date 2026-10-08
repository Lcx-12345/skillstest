// TypeScript 演示
interface Tool { name: string; type: string; }

const tools: Tool[] = [
  { name: "Write", type: "file" },
  { name: "Grep", type: "search" },
];

function listTools(items: Tool[]): string {
  return items.map((t) => `${t.name} (${t.type})`).join(", ");
}

console.log(`Tools: ${listTools(tools)}`);
