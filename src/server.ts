import { PrismaClient } from '@prisma/client';
import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fastifyCors from 'fastify-cors';
import { z } from 'zod';

const app = fastify();

app.register(fastifyCors, { origin: '*' });

const prisma = new PrismaClient();




app.get('/', async (req, res) => {
    res.send({ apiRodando: true });
});


app.get('/:code', async (req: FastifyRequest<{ Params: { code: string } }>, res: FastifyReply) => {
    const code = req.params.code;

    try {
        const link = await prisma.link.findUnique({ where: { code } });

        if (!link) {
            res.status(404).send('Link not found');
        } else {
            link.hits!++;
            await prisma.link.update({ where: { code }, data: { hits: link.hits } });
            res.redirect(link.url);
        }
    } catch (error) {
        console.log('get error', error);
        res.status(500).send('Internal Server Error');
    }
});



app.post('/new', async (req: any, reply: any) => {
    const createLinkSchema = z.object({
        url: z.string(),
        code: z.string(),
    });

    const { url, code } = createLinkSchema.parse(req.body);

    try {
        await prisma.link.create({ data: { url, code } });
        reply.status(200).send('Link created successfully');
    } catch (error) {
        console.log('post error:', error);
        reply.status(500).send('Internal Server Error');
    }
});



app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then(() => {
    console.log("HTTPS Server Running")
})