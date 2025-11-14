# 👥 Students Domain - Backend

> Documentação completa do domínio de Alunos

---

## 📋 Overview

O domínio **Students** gerencia todo o ciclo de vida dos alunos da academia, incluindo:
- ✅ Cadastro e dados pessoais
- ✅ Anamnese (histórico de saúde)
- ✅ Impedimentos físicos
- ✅ Avaliações físicas
- ✅ Planos de treinamento
- ✅ Compromissos de agenda

---

## 🎯 Endpoints

### Base Path: `/students`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| **GET** | `/students` | Listar alunos (paginado) | ✅ |
| **GET** | `/students/{id}` | Buscar por ID | ✅ |
| **POST** | `/students` | Criar novo aluno | ✅ |
| **PUT** | `/students/{id}` | Atualizar aluno | ✅ |
| **DELETE** | `/students/{id}` | Soft delete | ✅ |
| **POST** | `/students/{id}/restore` | Restaurar aluno | ✅ |

### Avaliações Físicas: `/students/{studentId}/evaluations`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| **GET** | `/evaluations` | Listar avaliações | ✅ |
| **GET** | `/evaluations/{id}` | Buscar por ID | ✅ |
| **POST** | `/evaluations` | Criar avaliação | ✅ |
| **PUT** | `/evaluations/{id}` | Atualizar | ✅ |
| **DELETE** | `/evaluations/{id}` | Deletar | ✅ |

---

## 📊 Data Model

### Student Entity
```java
@Entity
@Table(name = "students")
public class Student extends BaseEntity {
    private String name;
    private String surname;
    
    @Column(unique = true)
    private String email;
    
    private String phone;
    private String address;
    
    @Enumerated(EnumType.STRING)
    private Gender gender;
    
    private LocalDate birthDate;
    private String profession;
    
    @Embedded
    private AgeRange ageRange;
    
    @OneToOne(cascade = CascadeType.ALL)
    private Anamnesis anamnesis;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PhysicalImpairment> physicalImpairments;
    
    @OneToMany(mappedBy = "student")
    private List<PhysicalEvaluation> physicalEvaluations;
}
```

### Anamnesis (Embedded)
```java
@Embeddable
public class Anamnesis {
    private Boolean hasHeartDisease;
    private Boolean takesBloodPressureMedication;
    private Boolean hasDizziness;
    private String medication;
    private Boolean hasBackPain;
    private Boolean hasDiabetes;
    
    @Enumerated(EnumType.STRING)
    private InsomniaFrequency hasInsomnia;
    
    private Boolean hasDoctorPermission;
}
```

### Physical Impairment
```java
@Entity
@Table(name = "physical_impairments")
public class PhysicalImpairment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Enumerated(EnumType.STRING)
    private PhysicalImpairmentType type;
    
    private String description;
    
    @ManyToOne
    private Student student;
}
```

---

## 🔧 Business Rules

### 1. Email Uniqueness
- ✅ O email deve ser único entre todos os alunos ativos
- ✅ Alunos deletados (soft delete) não bloqueiam o email

**Implementação:**
```java
@Component
public class StudentValidationService {
    public void validateEmailUniqueness(String email, UUID excludeId) {
        if (studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNullAndIdNot(email, excludeId)) {
            throw new BusinessException("Email já está em uso");
        }
    }
}
```

### 2. Age Range Validation
- ✅ `minAge` não pode ser maior que `maxAge`
- ✅ Valores devem ser números positivos

**Implementação:**
```java
@Component
public class AgeRangeValidator {
    public void validate(Integer minAge, Integer maxAge) {
        if (minAge != null && maxAge != null && minAge > maxAge) {
            throw new ValidationException("minAge não pode ser maior que maxAge");
        }
    }
}
```

### 3. Soft Delete
- ✅ Alunos não são deletados fisicamente
- ✅ Campo `deletedAt` é preenchido com timestamp
- ✅ Queries filtram automaticamente deletados

---

## 📝 Request Examples

### Create Student
```http
POST /students
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "João",
  "surname": "Silva",
  "email": "joao.silva@example.com",
  "phone": "+55 11 98765-4321",
  "address": "Rua Example, 123",
  "gender": "M",
  "birthDate": "1990-05-15",
  "profession": "Engenheiro",
  "ageRange": {
    "minAge": 30,
    "maxAge": 40
  },
  "anamnesis": {
    "hasHeartDisease": false,
    "takesBloodPressureMedication": false,
    "hasDizziness": false,
    "medication": null,
    "hasBackPain": false,
    "hasDiabetes": false,
    "hasInsomnia": "no",
    "hasDoctorPermission": true
  },
  "physicalImpairments": [
    {
      "type": "motor",
      "description": "Lesão no joelho direito"
    }
  ]
}
```

### Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "João",
  "surname": "Silva",
  "email": "joao.silva@example.com",
  "phone": "+55 11 98765-4321",
  "address": "Rua Example, 123",
  "gender": "M",
  "birthDate": "1990-05-15",
  "profession": "Engenheiro",
  "ageRange": {
    "minAge": 30,
    "maxAge": 40
  },
  "anamnesis": {
    "hasHeartDisease": false,
    "takesBloodPressureMedication": false,
    "hasDizziness": false,
    "medication": null,
    "hasBackPain": false,
    "hasDiabetes": false,
    "hasInsomnia": "no",
    "hasDoctorPermission": true
  },
  "physicalImpairments": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "type": "motor",
      "description": "Lesão no joelho direito"
    }
  ],
  "createdAt": "2025-11-12T10:00:00Z",
  "updatedAt": "2025-11-12T10:00:00Z",
  "deletedAt": null
}
```

### List Students (Paginated)
```http
GET /students?page=0&size=20&search=João&gender=M&minAge=25&maxAge=40
Authorization: Bearer <token>
```

### Response
```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "João",
      "surname": "Silva",
      "email": "joao.silva@example.com",
      // ...
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true,
  "empty": false,
  "numberOfElements": 1
}
```

---

## 🎨 Architecture

### Layer Structure
```
StudentController (REST API)
    ↓
StudentService (Business Logic)
    ↓ ↓ ↓
StudentMapper | StudentValidationService | AgeRangeValidator
    ↓
StudentRepository (Data Access)
    ↓
Database (PostgreSQL)
```

### Files
```
org.conexaotreinamento.backend/
├── controller/
│   └── StudentController.java
├── service/
│   ├── StudentService.java
│   └── StudentValidationService.java
├── repository/
│   └── StudentRepository.java
├── mapper/
│   └── StudentMapper.java
├── entity/
│   ├── Student.java
│   ├── Anamnesis.java (Embedded)
│   └── PhysicalImpairment.java
└── dto/
    ├── request/
    │   ├── StudentRequestDTO.java
    │   └── AnamnesisRequestDTO.java
    └── response/
        ├── StudentResponseDTO.java
        └── AnamnesisResponseDTO.java
```

---

## 🧪 Testing

### Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class StudentServiceTest {
    @Mock
    private StudentRepository studentRepository;
    
    @Mock
    private StudentMapper studentMapper;
    
    @InjectMocks
    private StudentService studentService;
    
    @Test
    void shouldCreateStudentSuccessfully() {
        // Given
        StudentRequestDTO request = new StudentRequestDTO(/* ... */);
        Student student = new Student(/* ... */);
        
        when(studentMapper.toEntity(request)).thenReturn(student);
        when(studentRepository.save(student)).thenReturn(student);
        
        // When
        StudentResponseDTO result = studentService.create(request);
        
        // Then
        assertNotNull(result);
        verify(studentRepository).save(student);
    }
}
```

### Integration Tests
```java
@SpringBootTest
@Testcontainers
class StudentControllerIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void shouldCreateStudent() throws Exception {
        mockMvc.perform(post("/students")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + token)
                .content(json))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.name").value("João"));
    }
}
```

---

## 📚 Related Domains

- **[Physical Evaluations](../evaluations/overview.md)** - Avaliações físicas dos alunos
- **[Plans](../plans/overview.md)** - Planos de treinamento
- **[Schedules](../schedules/overview.md)** - Agendamento de treinos
- **[Events](../events/overview.md)** - Participação em eventos

---

## 🔗 See Also

- **[Backend API Overview](../../api/overview.md)**
- **[Error Handling](../../guides/error-handling.md)**
- **[Testing Guide](../../guides/testing.md)**
- **[Frontend Students Domain](../../../../web/docs/domains/students/overview.md)**

---

**Students Domain Documentation** 👥

