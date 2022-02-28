

Three steps for using API

1. Put query in file structured as a JSON doc
2. Login/authenticate to Realm App Services
3. Pass query as body to search call


Authentication/login

```
curl --location --request POST 'https://realm.mongodb.com/api/client/v2.0/app/wordleservice-lxqoh/auth/providers/anon-user/login'

```


Wordle search

```
curl -X POST \
                                                              -H 'api-key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJiYWFzX2RldmljZV9pZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCIsImJhYXNfZG9tYWluX2lkIjoiNjIxYjk1YzkyODNiYjFjMjM1NTg5NjgyIiwiZXhwIjoxNjQ2MDc3MjQ5LCJpYXQiOjE2NDYwNzU0NDksImlzcyI6IjYyMWQxZTM5NTgwOTgwM2Y4Y2YyMjNiYSIsInN0aXRjaF9kZXZJZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCIsInN0aXRjaF9kb21haW5JZCI6IjYyMWI5NWM5MjgzYmIxYzIzNTU4OTY4MiIsInN1YiI6IjYyMWQxZTM5NTgwOTgwM2Y4Y2YyMjNiNCIsInR5cCI6ImFjY2VzcyJ9.FKFR0kI88Zyxj-bYZdmVI4YGqZWrst9_2TitG9YEjbM' \
                                                              -H 'Content-Type: application/json' \
                                                              -d @./test.json \
                                                              https://data.mongodb-api.com/app/wordleservice-lxqoh/endpoint/search
```															  
