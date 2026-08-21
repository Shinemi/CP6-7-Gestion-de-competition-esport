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

        expect(response.status).toBe(200)

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

        teamId = response.data.team.id
    })

    test('US1 - Refuser un email invalide', async () => {

        const response = await api.post('/auth/register', {
            name: 'Invalid Email User',
            email: `invalid-${Date.now()}`,
            password: 'Test1234!'
        })

        expect(response.status).toBe(400)
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

    test('Team API - Refuser un identifiant invalide', async () => {

        const response = await api.get(
            '/team/not-an-object-id/teamDetails',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        expect(response.status).toBe(400)
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


    test('US7 - Ajouter puis retirer un membre', async () => {

        const thirdUser = {
            name: `Third User ${Date.now()}`,
            email: `third${Date.now()}@example.com`,
            password: 'Test1234!'
        }

        const registerResponse = await api.post('/auth/register', thirdUser)
        expect(registerResponse.status).toBe(201)

        const addResponse = await api.post(
            `/team/${teamId}/members`,
            { email: thirdUser.email },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        expect(addResponse.status).toBe(200)

        const removeResponse = await api.delete(
            `/team/${teamId}/members/${registerResponse.data.user.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
        expect(removeResponse.status).toBe(200)
    })

    test('US8 - Refuser la création d’un tournoi sans rôle organisateur', async () => {

        const response = await api.post(
            '/tournament/createTournament',
            {
                name: `Tournament Test ${Date.now()}`,
                game: 'Valorant',
                date: new Date(Date.now() + 86400000).toISOString(),
                rules: 'Best of three'
            },
            { headers: { Authorization: `Bearer ${token}` } }
        )

        expect(response.status).toBe(403)
    })

    test('US9 - Retourner 404 pour un tournoi absent', async () => {

        const response = await api.patch(
            '/tournament/507f1f77bcf86cd799439011/updateTournament',
            { name: 'Updated tournament' },
            { headers: { Authorization: `Bearer ${token}` } }
        )

        expect(response.status).toBe(404)
    })

    test('US10 - Retourner 404 pour la suppression d’un tournoi absent', async () => {

        const response = await api.delete(
            '/tournament/507f1f77bcf86cd799439011/deleteTournament',
            { headers: { Authorization: `Bearer ${token}` } }
        )

        expect(response.status).toBe(404)
    })

    test('US11 - Exiger une équipe pour une inscription', async () => {

        const response = await api.post(
            '/tournament/507f1f77bcf86cd799439011/register',
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        )

        expect(response.status).toBe(400)
    })

    test('US12 - Consulter les tournois ouverts', async () => {

        const response = await api.get(
            '/tournament/open',
            { headers: { Authorization: `Bearer ${token}` } }
        )

        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('tournaments')
    })

    test('US13 - Retourner 404 pour un tournoi absent', async () => {

        const response = await api.get(
            '/tournament/507f1f77bcf86cd799439011/teams',
            { headers: { Authorization: `Bearer ${token}` } }
        )

        expect(response.status).toBe(404)
    })

    test('US14 - Refuser la suppression d’une équipe à un utilisateur', async () => {

        const response = await api.delete(
            `/team/${teamId}/deleteTeam`,
            { headers: { Authorization: `Bearer ${token}` } }
        )

        expect(response.status).toBe(403)
    })

    test('US15 - Refuser les statistiques à un utilisateur', async () => {

        const response = await api.get(
            '/tournament/stats',
            { headers: { Authorization: `Bearer ${token}` } }
        )

        expect(response.status).toBe(403)
    })

    test('US16 - Refuser la modification des rôles à un utilisateur', async () => {

        const response = await api.put(
            '/auth/users/507f1f77bcf86cd799439011/role',
            { role: 'organisateur' },
            { headers: { Authorization: `Bearer ${token}` } }
        )

        expect(response.status).toBe(403)
    })

    test('US18 - Consulter les tournois de son équipe', async () => {

        const response = await api.get(
            `/team/${teamId}/teamTournaments`,
            { headers: { Authorization: `Bearer ${secondToken}` } }
        )

        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('tournaments')
    })

})