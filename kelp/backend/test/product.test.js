import * as chai from 'chai';
import request from 'supertest';
import app from '../server.js';
import connection from '../connection.js';
import { User } from '../schema.js';
import sinon from 'sinon';
import axios from 'axios';
import chaiHttp from 'chai-http';
import bcrypt from 'bcryptjs';


const expect = chai.expect;
chai.use(chaiHttp);


let token;
before(async () => {

    await connection();

    const hashedPassword = await bcrypt.hash('soma2025', 10);
    await User.create({
        email: 'victor@publicaai.com',
        password: hashedPassword
    });
});

describe('POST /auth', () => {
    it('should return a status 200', async () => {
        const res = await request(app)
            .post('/api/auth')
            .send({
                email: 'victor@publicaai.com',
                password: 'soma2025'
            });
            expect(res.status).to.equal(200);
            token = res.body.token
    });
});

describe('POST /setup', () => {
    let axiosPost;

    before(() => {
        axiosPost = sinon.stub(axios, 'post').resolves({ data: { success: true,
            choices: [{ message: { content: "AI response here" }}]
         }});
    });
    after(() => {
        axiosPost.restore();
    });
    it('should return chatbot response', async () => {
        const res = await request(app)
            .post('/api/setup')
            .set('Authorization', token)
            .send({
                provider: 'OpenAI',
                model: 'gpt-4o',
                prompt_message: 'How are you',
                use_search: false,
            });
            expect(res.status).to.equal(200); 
    });

    it("should successfully upload a PDF and return AI response", (done) => {
        request(app)
            .post("/api/setup") 
            .set("Authorization", token)
            .set("Content-Type", "multipart/form-data")
            .attach("file", Buffer.from("Fake PDF Content"), "test.pdf")
            .field("provider", "OpenAI") 
            .field("model", "gpt-4o")
            .field("prompt_message", "How are you")
            .field("use_search", "false")
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
    

});

describe('GET /getchatHistory', () => {
    it('should return user chat as array', async () => {
        const res = await request(app)
            .get('/api/chatHistory')
            .set('Authorization', token);
            expect(res.status).to.equal(200);
    });
});

describe('GET /api/messagesByChatHistoryId', () => {
    it('should return chat history by provider and model', async () => {
        const res = await request(app)
            .get('/api/messagesByChatHistoryId')
            .send({
                chatHistoryId: '1'
            })
            .set('Authorization', token)
            expect(res.status).to.equal(200);
    });
});

