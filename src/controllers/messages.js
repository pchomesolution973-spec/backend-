import prisma from "../../prisma/client.js";

export async function sendMessage(req, res) {
  const id = Number(req.params.id);
  const msg = await prisma.message.create({
    data: {
      content: req.body.content,
      interventionId: id,
      senderId: req.user.id
    }
  });

  res.json(msg);
}
