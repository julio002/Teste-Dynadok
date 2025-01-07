import fs from "fs";
import path from "path";

interface Task {
  id: number;
  text: string;
  summary: string | null;
  lang: string;
}

export class TasksRepository {
  private tasks: Task[] = [];
  private currentId: number = 1;
  private filePath: string = path.resolve(__dirname, "tasks.json");

  constructor() {
    this.loadTasksFromFile();
  }

  private loadTasksFromFile(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, "utf-8");

        this.tasks = JSON.parse(data);

        // Atualiza o ID atual para evitar duplicação
        const maxId = this.tasks.reduce(
          (max, task) => Math.max(max, task.id),
          0
        );

        this.currentId = maxId + 1;
      }
    } catch (error) {
      console.error("Erro ao carregar tarefas do arquivo:", error);
    }
  }

  private saveTasksToFile(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.tasks, null, 2));
    } catch (error) {
      console.error("Erro ao salvar tarefas no arquivo:", error);
    }
  }

  createTask(text: string, lang: string): Task {
    const task: Task = {
      id: this.currentId++,
      text,
      summary: null,
      lang,
    };

    this.tasks.push(task);
    this.saveTasksToFile();

    return task;
  }

  updateTask(id: number, summary: string): Task | null {
    const taskIndex = this.tasks.findIndex((t) => t.id === id);

    if (taskIndex > -1) {
      this.tasks[taskIndex].summary = summary;
      this.saveTasksToFile();

      return this.tasks[taskIndex];
    }

    return null;
  }

  getTaskById(id: number): Task | null {
    return this.tasks.find((t) => t.id === id) || null;
  }

  getAllTasks(): Task[] {
    return this.tasks;
  }

  deleteTask(id: number): boolean {
    const initialLength = this.tasks.length;

    this.tasks = this.tasks.filter((t) => t.id !== id);

    if (this.tasks.length < initialLength) {
      this.saveTasksToFile();

      return true;
    }

    return false;
  }
}
