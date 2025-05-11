## Pre-commit

Install pre-commit to make sure you never fail linting in CI.

```shell
poetry run pre-commit install
```

### API Documentations

<img width="623" alt="image" src="https://github.com/user-attachments/assets/389c149f-eee8-4489-a9ce-20fcd3366160" />


### Database ER Diagram

<img width="848" alt="ER" src="https://github.com/user-attachments/assets/779dede6-a67f-45ee-92cd-107c4a26a410" />

### Testing

The testing framework we used for our unit and integration tests was Pytest. The unit tests thoroughly validate our data model schema with Pydantic and the generation pipeline operations. Our integration tests use TestClient from FastAPI to simulate HTTP requests and check our different endpoints.

To run tests, make sure you are in back_end directory. Then run the following command.
```shell
python -m  pytest .\app\test
```

Current Test Results:

<img width="848" alt="test results" src ="https://github.com/user-attachments/assets/c9ae97e9-2b4e-4edf-98b2-e768a793959a" />

Current Coverage Report:

<img width="848" alt="coverage report" src ="https://github.com/user-attachments/assets/b3e16c06-ebf0-4a3a-8d4f-479c0bb550dd" />

