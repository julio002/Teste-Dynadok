import { Router, Request, Response } from "express";
import { TasksRepository } from "../repositories/tasksRepository";
import axios from "axios"; // Usado para chamadas ao serviço Python

const router = Router();
const tasksRepository = new TasksRepository();

// Idiomas suportados
const SUPPORTED_LANGUAGES = ["pt", "en", "es"];

// POST: Cria uma tarefa e solicita resumo ao serviço Python
router.post("/", async (req: Request, res: Response) => {
  try {
    const { text, lang } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Campo "text" é obrigatório.' });
    }

    if (!lang || !SUPPORTED_LANGUAGES.includes(lang)) {
      return res.status(400).json({ error: "Language not supported" });
    }

    // Cria a tarefa sem resumo inicialmente
    const task = tasksRepository.createTask(text, lang);

    // Solicita o resumo ao serviço Python
    try {
      const response = await axios.post("http://0.0.0.0:8000/summarize", {
        text,
        lang,
      });

      const summary = response.data.summary;

      // Atualiza a tarefa com o resumo gerado
      tasksRepository.updateTask(task.id, summary);

      return res.status(201).json({
        message: "Tarefa criada com sucesso!",
        task: tasksRepository.getTaskById(task.id),
      });
    } catch (error) {
      console.error("Erro ao comunicar com o serviço Python:", error);
      return res
        .status(500)
        .json({ error: "Erro ao gerar o resumo do texto." });
    }
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return res
      .status(500)
      .json({ error: "Ocorreu um erro ao criar a tarefa." });
  }
});

// GET: Retorna uma tarefa específica por ID
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const task = tasksRepository.getTaskById(Number(id));

  if (!task) {
    return res.status(404).json({ error: "Tarefa não encontrada." });
  }

  return res.json(task);
});

// DELETE: Remove uma tarefa por ID
router.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const success = tasksRepository.deleteTask(Number(id));

  if (!success) {
    return res.status(404).json({ error: "Tarefa não encontrada." });
  }

  return res.status(204).send();
});

router.get("/", (req, res) => {
  const tasks = tasksRepository.getAllTasks();
  return res.json(tasks);
});

export default router;
