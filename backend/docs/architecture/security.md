# 🛡️ Security Architecture

> Arquitetura de segurança do backend

---

## 📋 Overview

O sistema implementa múltiplas camadas de segurança:
- ✅ **Autenticação JWT**
- ✅ **Autorização baseada em roles (RBAC)**
- ✅ **Password hashing com BCrypt**
- ✅ **Proteção contra SQL Injection**
- ✅ **Proteção CORS**
- ✅ **Soft deletes (data retention)**

---

## 🔐 Authentication Layer

### JWT (JSON Web Tokens)

#### Token Generation
```java
@Service
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    public String generateToken(User user) {
        return Jwts.builder()
            .setSubject(user.getId().toString())
            .claim("email", user.getEmail())
            .claim("role", user.getRole().name())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(SignatureAlgorithm.HS512, secret)
            .compact();
    }
}
```

#### Token Validation
```java
public boolean validateToken(String token) {
    try {
        Jwts.parser()
            .setSigningKey(secret)
            .parseClaimsJws(token);
        return true;
    } catch (JwtException | IllegalArgumentException e) {
        return false;
    }
}
```

#### Token Structure
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "ADMIN",
  "iat": 1632487600,
  "exp": 1632574000
}
```

---

## 🛡️ Authorization Layer

### Role-Based Access Control (RBAC)

#### Roles
- **ADMIN**: Acesso total
- **TRAINER**: Acesso limitado

#### Security Configuration
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/auth/login").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                
                // Admin only
                .requestMatchers("/administrators/**").hasRole("ADMIN")
                .requestMatchers("/trainers/**").hasRole("ADMIN")
                .requestMatchers("/reports/**").hasRole("ADMIN")
                
                // Authenticated users (ADMIN or TRAINER)
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

#### JWT Authentication Filter
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) {
        String token = extractToken(request);
        
        if (token != null && jwtUtil.validateToken(token)) {
            String userId = jwtUtil.getUserIdFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            UserDetails userDetails = loadUserById(userId);
            UsernamePasswordAuthenticationToken auth = 
                new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        
        filterChain.doFilter(request, response);
    }
}
```

---

## 🔒 Password Security

### BCrypt Hashing

#### Password Encoding
```java
@Service
public class UserService {
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public User createUser(UserRequestDTO request) {
        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        return userRepository.save(user);
    }
}
```

#### Password Verification
```java
@Service
public class AuthService {
    public JwtResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new BusinessException("Invalid credentials"));
        
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException("Invalid credentials");
        }
        
        String token = jwtUtil.generateToken(user);
        return new JwtResponseDTO(token, "Bearer");
    }
}
```

#### Configuration
```java
@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Strength: 12 rounds
    }
}
```

---

## 🛡️ SQL Injection Prevention

### JPA & Prepared Statements

#### Safe Query (JPA)
```java
@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    // Safe: JPA uses prepared statements
    @Query("SELECT s FROM Student s WHERE s.email = :email AND s.deletedAt IS NULL")
    Optional<Student> findByEmail(@Param("email") String email);
}
```

#### Safe Native Query
```java
@Query(value = "SELECT * FROM students WHERE email = ?1 AND deleted_at IS NULL", 
       nativeQuery = true)
Optional<Student> findByEmailNative(String email);
```

#### ❌ Unsafe (Never do this)
```java
// DON'T: String concatenation = SQL Injection vulnerability
String query = "SELECT * FROM students WHERE email = '" + email + "'";
entityManager.createNativeQuery(query).getResultList();
```

---

## 🌐 CORS Configuration

### Allowed Origins
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allowed origins
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",  // Next.js dev
            "https://conexao-treinamento.com"  // Production
        ));
        
        // Allowed methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        
        // Allowed headers
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "X-Requested-With"
        ));
        
        // Expose headers
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization", "Location"
        ));
        
        // Allow credentials (cookies)
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

---

## 🗑️ Soft Deletes

### Implementation

#### Base Entity
```java
@MappedSuperclass
public abstract class BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;
    
    @Column
    private Instant deletedAt;  // Null = not deleted
}
```

#### Soft Delete Method
```java
@Service
public class StudentService {
    public void delete(UUID id) {
        Student student = findEntityById(id);
        
        if (student.getDeletedAt() != null) {
            throw new BusinessException("Student is already deleted");
        }
        
        student.setDeletedAt(Instant.now());
        studentRepository.save(student);
    }
}
```

#### Filter Deleted Records
```java
@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    // Only active students
    List<Student> findByDeletedAtIsNull();
    
    // Specific student (active only)
    @Query("SELECT s FROM Student s WHERE s.id = :id AND s.deletedAt IS NULL")
    Optional<Student> findByIdAndNotDeleted(@Param("id") UUID id);
}
```

#### Restore Method
```java
public StudentResponseDTO restore(UUID id) {
    Student student = studentRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Student", id));
    
    if (student.getDeletedAt() == null) {
        throw new BusinessException("Student is not deleted");
    }
    
    student.setDeletedAt(null);
    Student restored = studentRepository.save(student);
    return studentMapper.toResponse(restored);
}
```

---

## 🔍 Input Validation

### Jakarta Bean Validation

#### DTO Validation
```java
public record StudentRequestDTO(
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    String name,
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number")
    String phone,
    
    @Past(message = "Birth date must be in the past")
    LocalDate birthDate
) {}
```

#### Controller Validation
```java
@RestController
@RequestMapping("/students")
public class StudentController {
    @PostMapping
    public ResponseEntity<StudentResponseDTO> create(
        @Valid @RequestBody StudentRequestDTO request) {  // @Valid triggers validation
        // ...
    }
}
```

#### Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidation(
        MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        ValidationErrorResponse response = new ValidationErrorResponse(
            400,
            "Validation failed",
            "VALIDATION_ERROR",
            errors,
            Instant.now(),
            request.getRequestURI()
        );
        
        return ResponseEntity.badRequest().body(response);
    }
}
```

---

## 🚫 Security Best Practices

### ✅ Implemented
- [x] JWT authentication
- [x] BCrypt password hashing (strength 12)
- [x] Role-based authorization
- [x] CORS configuration
- [x] SQL Injection prevention (JPA)
- [x] Input validation (Jakarta Validation)
- [x] Soft deletes (data retention)
- [x] HTTPS ready (use reverse proxy)
- [x] Secure headers (HSTS, X-Frame-Options)

### 🔄 Planned
- [ ] Refresh tokens
- [ ] Rate limiting
- [ ] Account lockout (failed login attempts)
- [ ] Password complexity rules
- [ ] Two-factor authentication (2FA)
- [ ] API key authentication (for external integrations)
- [ ] Audit logging (who did what, when)

### ⚠️ Production Checklist
- [ ] Change JWT secret (use strong random key)
- [ ] Disable Swagger UI in production
- [ ] Enable HTTPS only
- [ ] Configure secure session cookies
- [ ] Set appropriate CORS origins
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Monitor logs for suspicious activity

---

## 🧪 Testing Security

### Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class JwtUtilTest {
    @Test
    void shouldGenerateValidToken() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setRole(Role.ADMIN);
        
        String token = jwtUtil.generateToken(user);
        
        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
    }
}
```

### Integration Tests
```java
@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void shouldReturn401WhenNoToken() throws Exception {
        mockMvc.perform(get("/students"))
            .andExpect(status().isUnauthorized());
    }
    
    @Test
    void shouldReturn403WhenInsufficientRole() throws Exception {
        String trainerToken = generateTrainerToken();
        
        mockMvc.perform(get("/administrators")
                .header("Authorization", "Bearer " + trainerToken))
            .andExpect(status().isForbidden());
    }
}
```

---

## 📚 Related Documentation

- **[Authentication Guide](../api/authentication.md)**
- **[Frontend Authentication](../../../web/docs/architecture/authentication.md)**
- **[Error Handling](../guides/error-handling.md)**

---

**Security Architecture - Conexão Treinamento** 🛡️

