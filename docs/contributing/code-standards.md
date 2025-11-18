# 📝 Code Standards - Conexão Treinamento

> Padrões de código para contribuir com o projeto

---

## 📋 Overview

Este documento define os padrões de código que todos os contribuidores devem seguir para manter a consistência e qualidade do projeto.

---

## ☕ Backend (Java/Spring Boot)

### Code Style

#### Google Java Style Guide
Seguimos o **[Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)** com pequenas adaptações.

#### Key Rules
- **Indentação:** 4 espaços (não tabs)
- **Line length:** Máximo 120 caracteres
- **Imports:** Organize e remova não utilizados
- **Braces:** Sempre use braces, mesmo para blocos de 1 linha

#### Example
```java
// ✅ Good
public class StudentService {
    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;

    public StudentService(StudentRepository studentRepository, 
                         StudentMapper studentMapper) {
        this.studentRepository = studentRepository;
        this.studentMapper = studentMapper;
    }

    public StudentResponseDTO create(StudentRequestDTO request) {
        validateEmailUniqueness(request.email());
        Student entity = studentMapper.toEntity(request);
        Student saved = studentRepository.save(entity);
        return studentMapper.toResponse(saved);
    }
}

// ❌ Bad
public class StudentService{
  private final StudentRepository studentRepository;
  public StudentService(StudentRepository studentRepository){this.studentRepository=studentRepository;}
  public StudentResponseDTO create(StudentRequestDTO request){
      return studentMapper.toResponse(studentRepository.save(studentMapper.toEntity(request)));
  }
}
```

### Naming Conventions

#### Classes
```java
// Entities
public class Student extends BaseEntity { }

// DTOs
public record StudentRequestDTO(...) { }
public record StudentResponseDTO(...) { }

// Services
@Service
public class StudentService { }

// Repositories
@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> { }

// Controllers
@RestController
public class StudentController { }

// Mappers
@Component
public class StudentMapper { }

// Validators
@Component
public class StudentValidationService { }
```

#### Methods
```java
// Query methods: find*, get*, search*
public Student findById(UUID id) { }
public Optional<Student> findByEmail(String email) { }

// Command methods: create*, update*, delete*, save*
public StudentResponseDTO create(StudentRequestDTO request) { }
public StudentResponseDTO update(UUID id, StudentRequestDTO request) { }
public void delete(UUID id) { }

// Boolean methods: is*, has*, can*
public boolean isDeleted() { }
public boolean hasPermission() { }
```

#### Variables
```java
// Use descriptive names
Student student = findById(id);
StudentResponseDTO response = studentMapper.toResponse(student);

// Avoid abbreviations
Student std = findById(id); // ❌ Bad
StudentResponseDTO resp = studentMapper.toResponse(std); // ❌ Bad
```

### Architecture Patterns

#### Controller Pattern
```java
@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
@Tag(name = "Students", description = "Student management endpoints")
public class StudentController {
    private final StudentService studentService;

    @PostMapping
    @Operation(summary = "Create a new student")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Student created"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<StudentResponseDTO> create(
        @Valid @RequestBody StudentRequestDTO request) {
        StudentResponseDTO response = studentService.create(request);
        URI location = URI.create("/students/" + response.id());
        return ResponseEntity.created(location).body(response);
    }
}
```

#### Service Pattern
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class StudentService {
    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;
    private final StudentValidationService validationService;

    @Transactional
    public StudentResponseDTO create(StudentRequestDTO request) {
        log.info("Creating student with email: {}", request.email());
        
        validationService.validateEmailUniqueness(request.email(), null);
        
        Student entity = studentMapper.toEntity(request);
        Student saved = studentRepository.save(entity);
        
        log.info("Student created with ID: {}", saved.getId());
        return studentMapper.toResponse(saved);
    }
}
```

#### Mapper Pattern
```java
@Component
public class StudentMapper {
    public StudentResponseDTO toResponse(Student entity) {
        return new StudentResponseDTO(
            entity.getId(),
            entity.getName(),
            entity.getSurname(),
            entity.getEmail(),
            // ...
        );
    }

    public Student toEntity(StudentRequestDTO dto) {
        Student student = new Student();
        student.setName(dto.name());
        student.setSurname(dto.surname());
        student.setEmail(dto.email());
        // ...
        return student;
    }
}
```

### Exception Handling

#### Use Custom Exceptions
```java
// ✅ Good
throw new ResourceNotFoundException("Student", id);
throw new BusinessException("Email is already in use");
throw new ValidationException("Age range is invalid");

// ❌ Bad
throw new RuntimeException("Student not found");
throw new IllegalArgumentException("Email is already in use");
```

### Logging

#### Use SLF4J with Lombok
```java
@Slf4j
@Service
public class StudentService {
    public StudentResponseDTO create(StudentRequestDTO request) {
        log.debug("Creating student: {}", request);
        
        try {
            // ...
            log.info("Student created successfully: {}", result.id());
            return result;
        } catch (Exception e) {
            log.error("Error creating student", e);
            throw e;
        }
    }
}
```

#### Log Levels
- **ERROR:** Erros que precisam atenção imediata
- **WARN:** Situações potencialmente problemáticas
- **INFO:** Eventos importantes (criação, atualização, delete)
- **DEBUG:** Informações detalhadas para debug
- **TRACE:** Informações muito detalhadas (raramente usado)

---

## ⚛️ Frontend (React/TypeScript)

### Code Style

#### Prettier Configuration
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

#### ESLint Rules
- Use TypeScript strict mode
- No `any` types (use `unknown` when necessary)
- Prefer `const` over `let`
- Use arrow functions for components

### Component Structure

#### File Organization
```
components/students/
├── students-page-view.tsx      # Main page view
├── student-list.tsx            # List component
├── student-card.tsx            # Card component
├── student-create-dialog.tsx   # Create dialog
└── student-edit-dialog.tsx     # Edit dialog
```

#### Component Pattern
```tsx
// ✅ Good: Typed, documented, clean
"use client"

import { useStudents } from "@/lib/students/hooks/student-queries"
import { StudentCard } from "./student-card"
import { LoadingState } from "@/components/base/loading-state"

interface StudentsListProps {
  search?: string
  page?: number
}

/**
 * Displays a paginated list of students
 */
export function StudentsList({ search, page = 0 }: StudentsListProps) {
  const { data, isLoading, error } = useStudents({ search, page })

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState error={error} />

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data?.content.map((student) => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  )
}
```

### TypeScript Standards

#### No `any`
```tsx
// ❌ Bad
const handleClick = (e: any) => { }
const data: any = fetchData()

// ✅ Good
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { }
const data: Student[] = fetchData()
```

#### Use Interface for Props
```tsx
// ✅ Good
interface StudentCardProps {
  student: StudentResponseDto
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function StudentCard({ student, onEdit, onDelete }: StudentCardProps) {
  // ...
}
```

#### Use Type for Unions/Intersections
```typescript
type Status = 'active' | 'inactive' | 'deleted'
type StudentWithStats = Student & { totalWorkouts: number }
```

### React Query (TanStack Query)

#### Hooks Pattern
```typescript
// lib/students/hooks/student-queries.ts
import { useQuery } from "@tanstack/react-query"
import { findAllStudentsOptions } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"

export const useStudents = (params?: StudentQueryParams) => {
  return useQuery({
    ...findAllStudentsOptions({ 
      client: apiClient, 
      query: { 
        pageable: { page: params?.page || 0, size: 20 } as any,
        search: params?.search 
      } 
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
```

#### Mutations Pattern
```typescript
// lib/students/hooks/student-mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createStudentMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"
import { handleHttpError } from "@/lib/error-utils"

export const useCreateStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    ...createStudentMutation({ client: apiClient }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/students'] })
      toast({ title: "Student created successfully" })
    },
    onError: (error) => handleHttpError(error, "creating student"),
  })
}
```

### Styling (Tailwind CSS)

#### Use Utility Classes
```tsx
// ✅ Good
<Card className="p-6 hover:shadow-lg transition-shadow">
  <h2 className="text-2xl font-bold mb-4">Title</h2>
</Card>

// ❌ Bad (inline styles)
<Card style={{ padding: '24px', boxShadow: '...' }}>
  <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Title</h2>
</Card>
```

#### Use cn() for Conditional Classes
```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "rounded-lg border p-4",
  isActive && "border-primary",
  isDisabled && "opacity-50 cursor-not-allowed"
)} />
```

---

## 🧪 Testing Standards

### Backend Tests

#### Unit Test Example
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
    @DisplayName("Should create student successfully")
    void shouldCreateStudentSuccessfully() {
        // Given
        StudentRequestDTO request = new StudentRequestDTO(/* ... */);
        Student entity = new Student(/* ... */);
        StudentResponseDTO expected = new StudentResponseDTO(/* ... */);

        when(studentMapper.toEntity(request)).thenReturn(entity);
        when(studentRepository.save(entity)).thenReturn(entity);
        when(studentMapper.toResponse(entity)).thenReturn(expected);

        // When
        StudentResponseDTO result = studentService.create(request);

        // Then
        assertNotNull(result);
        assertEquals(expected.id(), result.id());
        verify(studentRepository).save(entity);
    }
}
```

### Frontend Tests (Future)
```tsx
// TODO: Add when E2E tests are implemented
```

---

## 📝 Documentation Standards

### Code Comments

#### JavaDoc for Public Methods
```java
/**
 * Creates a new student in the system.
 *
 * @param request the student data
 * @return the created student
 * @throws BusinessException if email is already in use
 */
public StudentResponseDTO create(StudentRequestDTO request) {
    // Implementation
}
```

#### TSDoc for TypeScript
```typescript
/**
 * Fetches a paginated list of students
 * @param params - Query parameters including page, size, and search
 * @returns Query result with student data
 */
export const useStudents = (params?: StudentQueryParams) => {
  // Implementation
}
```

---

## 🔀 Git Conventions

### Commits (Conventional Commits)
```bash
feat: add student creation endpoint
fix: correct age validation in student service
docs: update API documentation
refactor: extract mapper logic to separate class
test: add unit tests for student service
chore: update dependencies
```

### Branch Naming
```bash
feature/student-crud
bugfix/age-validation
hotfix/security-issue
refactor/extract-mappers
```

---

## ✅ Pre-Commit Checklist

- [ ] Código compila sem erros
- [ ] Testes passam
- [ ] Sem warnings do linter
- [ ] Código formatado (Prettier/Google Style)
- [ ] Imports organizados
- [ ] Comentários/JavaDoc adicionados (quando necessário)
- [ ] Sem `console.log` / `System.out.println` (use logger)
- [ ] Sem código comentado
- [ ] Sem TODOs (ou criar issue para resolver)

---

## 📚 Related Documentation

- **[Pull Request Guide](pull-request-guide.md)**
- **[Testing Guide](../../backend/docs/guides/testing.md)**
- **[Architecture Overview](../architecture/overview.md)**

---

**Code Standards - Conexão Treinamento** 📝


