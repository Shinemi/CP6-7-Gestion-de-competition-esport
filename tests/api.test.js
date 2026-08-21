const axios = require('axios')

const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
    validateStatus: () => true
})

let user
let token
let teamId
let secondUser
let secondToken

describe('API - Gestion de compétition esport', () => {

    test('US1 - Création de compte', async () => {

        user = {
            name: `Test User ${Date.now()}`,
            email: `test${Date.now()}@example.com`,
            password: 'Test1234!'
        }

        const response = await api.post('/auth/register', user)

        console.log('US1:', response.status, response.data)

        expect(response.status).toBe(201)
    })


    test('US2 - Connexion', async () => {

        const response = await api.post('/auth/login', {
            email: user.email,
            password: user.password
        })

        console.log('US2:', response.status, response.data)

        expect(response.status).toBe(201)

        expect(response.data).toHaveProperty('token')

        token = response.data.token
    })

    test('US4 - Modifier mon profil', async () => {

        const response = await api.patch(
            '/auth/updateProfile',
            {
                name: 'Test User Modified'
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        console.log('US4:', response.status, response.data)

        expect(response.status).toBe(200)
    })

    test('US5 - Créer une équipe', async () => {

        const response = await api.post(
            '/team/createTeam',
            {
                name: `Team Test ${Date.now()}`,
                game: 'Valorant'
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        console.log('US5:', response.status, response.data)

        expect(response.status).toBe(201)

        teamId = response.data.team._id
    })

    test('US17 - Consulter le détail d’une équipe', async () => {

        const response = await api.get(
            `/team/${teamId}/teamDetails`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        console.log('US17:', response.status, response.data)

        expect(response.status).toBe(200)
    })

    test('US6 - Rejoindre une équipe', async () => {

        secondUser = {
            name: `Second User ${Date.now()}`,
            email: `second${Date.now()}@example.com`,
            password: 'Test1234!'
        }

        const registerResponse = await api.post(
            '/auth/register',
            secondUser
        )

        expect(registerResponse.status).toBe(201)


        const loginResponse = await api.post(
            '/auth/login',
            {
                email: secondUser.email,
                password: secondUser.password
            }
        )

        expect(loginResponse.status).toBe(200)

        secondToken = loginResponse.data.token


        const joinResponse = await api.post(
            `/team/${teamId}/join`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${secondToken}`
                }
            }
        )

        console.log('US6:', joinResponse.status, joinResponse.data)

        expect(joinResponse.status).toBe(200)
    })
    
    

})