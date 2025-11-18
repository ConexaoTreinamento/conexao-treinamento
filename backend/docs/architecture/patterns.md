# 🏗️ Arquitetura e Padrões de Design

## 🎨 Layered Architecture Diagram

![Layered Architecture](architecture-layers.svg)

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Camadas da Aplicação](#camadas-da-aplicação)
- [Padrões Implementados](#padrões-implementados)
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [Fluxo de Requisição](#fluxo-de-requisição)
- [Convenções de Código](#convenções-de-código)

---

## 🎯 Visão Geral

O backend **Conexão Treinamento** segue uma arquitetura em camadas baseada em Domain-Driven Design (DDD) e padrões de design enterprise, utilizando Spring Boot 3.4.0 e Java 21.

### Tecnologias Principais

- **Framework**: Spring Boot 3.4.0
- **Linguagem**: Java 21
- **Segurança**: Spring Security + JWT
- **Documentação**: SpringDoc OpenAPI 3
- **Banco de Dados**: PostgreSQL + Spring Data JPA
- **Migração**: Flyway
- **Testes**: JUnit 5, Mockito, Testcontainers
- **Build**: Maven

---

## 🏛️ Camadas da Aplicação

```
┌─────────────────────────────────────────┐
│          Controller Layer               │
│  (REST endpoints, validação, DTOs)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│           Service Layer                 │
│  (Lógica de negócio, orquestração)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Repository Layer                │
│  (Acesso a dados, queries)              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Database Layer                 │
│      (PostgreSQL, entities)             │
└─────────────────────────────────────────┘
```

### 1. Controller Layer

**Responsabilidades:**
- Receber requisições HTTP
- Validar entrada (Bean Validation)
- Mapear DTOs
- Retornar respostas padronizadas
- Documentar API (OpenAPI)

**Exemplo:**
```java
@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Students", description = "Student management endpoints")
public class StudentController {
    
    private final StudentService studentService;
    
    @PostMapping
    @Operation(summary = "Create student")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Created"),
        @ApiResponse(responseCode = "400", description = "Bad Request")
    })
    public ResponseEntity<StudentResponseDTO> createStudent(
            @Valid @RequestBody StudentRequestDTO request) {
        
        log.info("Creating student with email: {}", request.email());
        StudentResponseDTO response = studentService.create(request);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        
        return ResponseEntity.created(location).body(response);
    }
}
```

### 2. Service Layer

**Responsabilidades:**
- Implementar lógica de negócio
- Coordenar operações entre repositórios
- Aplicar regras de validação complexas
- Gerenciar transações
- Lançar exceções customizadas

**Exemplo:**
```java
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StudentService {
    
    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;
    private final StudentValidationService validationService;
    
    public StudentResponseDTO create(StudentRequestDTO request) {
        log.debug("Creating student: {}", request.email());
        
        // Validação de negócio
        validationService.validateEmailUniqueness(request.email());
        
        // Conversão e persistência
        Student student = studentMapper.toEntity(request);
        Student saved = studentRepository.save(student);
        
        log.info("Student created successfully [ID: {}]", saved.getId());
        return studentMapper.toResponse(saved);
    }
}
```

### 3. Repository Layer

**Responsabilidades:**
- Abstração de acesso a dados
- Queries customizadas (JPQL, native SQL)
- Specifications para filtros dinâmicos

**Exemplo:**
```java
@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    
    boolean existsByEmailIgnoringCaseAndDeletedAtIsNull(String email);
    
    boolean existsByEmailIgnoringCaseAndDeletedAtIsNullAndIdNot(String email, UUID id);
    
    @Query("SELECT s FROM Student s WHERE s.deletedAt IS NULL")
    Page<Student> findByDeletedAtIsNull(Pageable pageable);
    
    Page<Student> findBySearchTermAndDeletedAtIsNull(
            String searchTerm, Pageable pageable);
}
```

---

## 🎨 Padrões Implementados

### 1. Mapper Pattern

**Objetivo**: Separar lógica de conversão entre DTOs e entidades.

**Implementação:**
```java
@Component
public class StudentMapper {
    
    public StudentResponseDTO toResponse(Student entity) {
        return new StudentResponseDTO(
                entity.getId(),
                entity.getEmail(),
                entity.getName(),
                // ... outros campos
        );
    }
    
    public Student toEntity(StudentRequestDTO request) {
        Student student = new Student();
        student.setEmail(request.email());
        student.setName(request.name());
        // ... outros campos
        return student;
    }
    
    public void updateEntity(StudentRequestDTO request, Student entity) {
        entity.setEmail(request.email());
        entity.setName(request.name());
        // ... outros campos
    }
}
```

**Benefícios:**
- ✅ Código DRY (Don't Repeat Yourself)
- ✅ Service layer mais limpa
- ✅ Fácil manutenção
- ✅ Reutilização de lógica de conversão

**Mappers Criados:**
- `StudentMapper`
- `TrainerMapper`
- `AdministratorMapper`
- `ExerciseMapper`
- `EventMapper`
- `PhysicalEvaluationMapper`
- `StudentPlanMapper`
- `TrainerScheduleMapper`
- `StudentCommitmentMapper`

### 2. Validation Service Pattern

**Objetivo**: Centralizar validações de negócio complexas.

**Implementação:**
```java
@Service
@RequiredArgsConstructor
public class StudentValidationService {
    
    private final StudentRepository studentRepository;
    
    public void validateEmailUniqueness(String email) {
        if (studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(email)) {
            throw new BusinessException("Email already exists: " + email);
        }
    }
    
    public void validateEmailUniqueness(String email, UUID excludeId) {
        if (studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNullAndIdNot(email, excludeId)) {
            throw new BusinessException("Email already exists: " + email);
        }
    }
    
    public void validateAgeRange(Integer minAge, Integer maxAge) {
        if (minAge != null && maxAge != null && maxAge < minAge) {
            throw new ValidationException(
                    "Max age (" + maxAge + ") must be >= min age (" + minAge + ")");
        }
    }
}
```

**Benefícios:**
- ✅ Validações reutilizáveis
- ✅ Service layer mais limpa
- ✅ Fácil testabilidade
- ✅ Single Responsibility Principle

**Validation Services Criados:**
- `StudentValidationService`
- `TrainerValidationService`
- `ExerciseValidationService`
- `AdministratorValidationService`

### 3. Global Exception Handling

**Objetivo**: Tratamento centralizado e padronizado de exceções.

**Implementação:**
```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        
        log.warn("Resource not found: {}", ex.getMessage());
        
        ErrorResponse error = new ErrorResponse(
                Instant.now(),
                HttpStatus.NOT_FOUND.value(),
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI(),
                "RESOURCE_NOT_FOUND"
        );
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        Map<String, String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        error -> error.getDefaultMessage() != null 
                                ? error.getDefaultMessage() 
                                : "Invalid value"
                ));
        
        ValidationErrorResponse response = new ValidationErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "BAD_REQUEST",
                "Validation failed",
                request.getRequestURI(),
                "VALIDATION_ERROR",
                errors
        );
        
        return ResponseEntity.badRequest().body(response);
    }
}
```

**Custom Exceptions:**

1. **ResourceNotFoundException** (404)
   ```java
   throw new ResourceNotFoundException("Student", studentId);
   ```

2. **BusinessException** (409/400)
   ```java
   throw new BusinessException("Email already exists");
   ```

3. **ValidationException** (400)
   ```java
   throw new ValidationException("Invalid age range");
   ```

### 4. DTO Pattern

**Request DTOs** (imutáveis com records):
```java
public record StudentRequestDTO(
        @NotBlank @Email String email,
        @NotBlank String name,
        @NotBlank String surname,
        @NotNull Gender gender,
        @NotNull @Past LocalDate birthDate
        // ... outros campos
) {}
```

**Response DTOs** (imutáveis com records):
```java
public record StudentResponseDTO(
        UUID id,
        String email,
        String name,
        String surname,
        Gender gender,
        LocalDate birthDate,
        Instant createdAt,
        Instant updatedAt
        // ... outros campos
) {}
```

**Shared DTOs:**

1. **PageResponse<T>** - Paginação genérica
   ```java
   public record PageResponse<T>(
           List<T> content,
           int page,
           int size,
           long totalElements,
           int totalPages,
           boolean first,
           boolean last,
           boolean empty,
           int numberOfElements
   ) {}
   ```

2. **ErrorResponse** - Erros padronizados
   ```java
   public record ErrorResponse(
           Instant timestamp,
           int status,
           String error,
           String message,
           String path,
           String errorCode,
           String traceId
   ) {}
   ```

3. **ValidationErrorResponse** - Erros de validação
   ```java
   public record ValidationErrorResponse(
           Instant timestamp,
           int status,
           String error,
           String message,
           String path,
           String errorCode,
           Map<String, String> errors
   ) {}
   ```

### 5. Repository Pattern

**Spring Data JPA** com queries customizadas:

```java
@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    
    // Query methods
    Page<Student> findByDeletedAtIsNull(Pageable pageable);
    
    // Custom JPQL
    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(CONCAT(s.name, ' ', s.surname, ' ', s.email)) LIKE LOWER(:searchTerm)")
    Page<Student> findBySearchTermAndDeletedAtIsNull(
            @Param("searchTerm") String searchTerm, 
            Pageable pageable);
    
    // Specifications (filtros dinâmicos)
    default Page<Student> findWithFilters(
            Specification<Student> spec, 
            Pageable pageable) {
        return findAll(spec, pageable);
    }
}
```

### 6. Soft Delete Pattern

Todas as entidades principais implementam soft delete:

```java
@Entity
@SQLDelete(sql = "UPDATE students SET deleted_at = NOW() WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class Student {
    
    @Column(name = "deleted_at")
    private Instant deletedAt;
    
    public void deactivate() {
        this.deletedAt = Instant.now();
    }
    
    public void reactivate() {
        this.deletedAt = null;
    }
}
```

### 7. Audit Pattern

Rastreamento automático de criação e modificação:

```java
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Student {
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;
}
```

---

## 📁 Estrutura de Diretórios

```
src/main/java/org/conexaotreinamento/conexaotreinamentobackend/
├── config/                         # Configurações do Spring
│   ├── SecurityConfig.java        # Segurança e JWT
│   └── OpenApiConfig.java         # Configuração Swagger
│
├── controller/                     # Controllers REST
│   ├── StudentController.java
│   ├── TrainerController.java
│   └── ...
│
├── service/                        # Lógica de negócio
│   ├── StudentService.java
│   ├── TrainerService.java
│   └── ...
│
├── repository/                     # Acesso a dados
│   ├── StudentRepository.java
│   ├── TrainerRepository.java
│   └── ...
│
├── mapper/                         # Conversão DTO ↔ Entity
│   ├── StudentMapper.java
│   ├── TrainerMapper.java
│   └── ...
│
├── entity/                         # Entidades JPA
│   ├── Student.java
│   ├── Trainer.java
│   └── ...
│
├── dto/                            # Data Transfer Objects
│   ├── request/                   # Request DTOs
│   │   ├── StudentRequestDTO.java
│   │   └── ...
│   └── response/                  # Response DTOs
│       ├── StudentResponseDTO.java
│       └── ...
│
├── shared/                         # Componentes compartilhados
│   ├── exception/                 # Exceções customizadas
│   │   ├── ResourceNotFoundException.java
│   │   ├── BusinessException.java
│   │   └── ValidationException.java
│   ├── dto/                       # DTOs compartilhados
│   │   ├── ErrorResponse.java
│   │   ├── ValidationErrorResponse.java
│   │   └── PageResponse.java
│   └── validation/                # Validadores
│       ├── AgeRangeValidator.java
│       └── DateRangeValidator.java
│
├── exception/                      # Exception Handlers
│   └── GlobalExceptionHandler.java
│
└── enums/                          # Enumerações
    ├── Role.java
    ├── Gender.java
    └── ...
```

---

## 🔄 Fluxo de Requisição

### Exemplo: Criar um Estudante

```
1. HTTP Request
   POST /students
   Body: { "email": "john@example.com", "name": "John", ... }
   ↓
2. Controller Layer
   - @Valid valida campos (Bean Validation)
   - StudentController.createStudent()
   ↓
3. Service Layer
   - StudentService.create()
   - StudentValidationService.validateEmailUniqueness()
   - StudentMapper.toEntity()
   ↓
4. Repository Layer
   - StudentRepository.save()
   ↓
5. Database
   - INSERT INTO students ...
   ↓
6. Response
   - StudentMapper.toResponse()
   - ResponseEntity<StudentResponseDTO>
   - Status: 201 Created
   - Location: /students/{id}
```

### Tratamento de Erros

```
Erro: Email duplicado
↓
StudentValidationService.validateEmailUniqueness()
↓
throw new BusinessException("Email already exists")
↓
GlobalExceptionHandler.handleBusinessException()
↓
ErrorResponse {
  "errorCode": "BUSINESS_ERROR",
  "message": "Email already exists",
  "status": 409
}
↓
HTTP 409 Conflict
```

---

## 📝 Convenções de Código

### Nomenclatura

**Controllers:**
```java
@RestController
@RequestMapping("/students")  // plural, lowercase
public class StudentController {
    public ResponseEntity<StudentResponseDTO> createStudent(...) {}
    public ResponseEntity<PageResponse<StudentResponseDTO>> findAllStudents(...) {}
}
```

**Services:**
```java
@Service
public class StudentService {
    public StudentResponseDTO create(StudentRequestDTO request) {}
    public StudentResponseDTO findById(UUID id) {}
    public PageResponse<StudentResponseDTO> findAll(...) {}
    public StudentResponseDTO update(UUID id, StudentRequestDTO request) {}
    public void delete(UUID id) {}
}
```

**Repositories:**
```java
@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    Page<Student> findByDeletedAtIsNull(Pageable pageable);
}
```

### Logging

```java
@Slf4j
public class StudentService {
    
    public StudentResponseDTO create(StudentRequestDTO request) {
        log.info("Creating student with email: {}", request.email());
        log.debug("Student details: {}", request);
        
        // ... lógica
        
        log.info("Student created successfully [ID: {}]", saved.getId());
        return response;
    }
}
```

**Níveis de Log:**
- `log.error()`: Erros críticos
- `log.warn()`: Avisos importantes
- `log.info()`: Operações principais (CRUD)
- `log.debug()`: Detalhes de debugging

### Validação

**Bean Validation (Request DTOs):**
```java
public record StudentRequestDTO(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,
        
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name
) {}
```

**Business Validation (Services):**
```java
public class StudentValidationService {
    public void validateEmailUniqueness(String email) {
        if (repository.existsByEmail(email)) {
            throw new BusinessException("Email already exists");
        }
    }
}
```

---

## 🔐 Segurança

### JWT Authentication

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        return http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
```

### Role-Based Access Control

```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteStudent(UUID id) {
    // Apenas administradores podem deletar
}
```

---

## 📊 Testes

### Estrutura de Testes

```
src/test/java/
├── unit/                           # Testes unitários
│   ├── controller/                # Controllers isolados
│   ├── service/                   # Services isolados
│   └── entity/                    # Entidades
│
└── integration/                    # Testes de integração
    ├── controller/                # Controllers com Spring context
    └── repository/                # Repositories com banco H2
```

### Exemplo de Teste Unitário

```java
@ExtendWith(MockitoExtension.class)
class StudentServiceTest {
    
    @Mock
    private StudentRepository repository;
    
    @Mock
    private StudentMapper mapper;
    
    @InjectMocks
    private StudentService service;
    
    @Test
    void shouldCreateStudentSuccessfully() {
        // Given
        StudentRequestDTO request = createRequest();
        Student entity = createEntity();
        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);
        
        // When
        StudentResponseDTO response = service.create(request);
        
        // Then
        assertThat(response).isNotNull();
        verify(repository).save(entity);
    }
}
```

---

## 🚀 Deploy e Build

### Build do Projeto

```bash
# Compilar
./mvnw clean compile

# Testes
./mvnw test

# Package (JAR)
./mvnw package

# Pular testes
./mvnw package -DskipTests
```

### Executar

```bash
# Desenvolvimento
./mvnw spring-boot:run

# Produção (com JAR)
java -jar target/conexao-treinamento-backend-0.0.1-SNAPSHOT.jar
```

---

## 📚 Recursos Adicionais

- [Guia de Migração](./MIGRATION-GUIDE.md)
- [Documentação da API](./api-documentation.md)
- [OpenAPI Spec](../API/openapi.yml)
- [Spring Boot Docs](https://docs.spring.io/spring-boot/docs/current/reference/html/)

---

**Última Atualização**: Novembro 2025  
**Versão da Arquitetura**: 2.0

