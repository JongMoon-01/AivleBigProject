package com.edtech.edtech_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * EdTech 백엔드 애플리케이션의 메인 클래스
 * 
 * Spring Boot 애플리케이션의 진입점으로, 애플리케이션을 시작하는 역할을 합니다.
 * @SpringBootApplication 어노테이션은 다음 세 가지 어노테이션을 포함합니다:
 * - @Configuration: 스프링 설정 클래스임을 나타냅니다
 * - @EnableAutoConfiguration: 스프링 부트의 자동 설정을 활성화합니다
 * - @ComponentScan: 컴포넌트 스캔을 활성화하여 @Component, @Service, @Repository 등을 자동 감지합니다
 */
@SpringBootApplication
public class EdtechBackendApplication {

	/**
	 * 애플리케이션의 메인 메서드
	 * 
	 * Spring Boot 애플리케이션을 실행합니다.
	 * 내장 톰캣 서버가 시작되고, 애플리케이션 컨텍스트가 로드됩니다.
	 * 
	 * @param args 커맨드 라인 인자
	 */
	public static void main(String[] args) {
		SpringApplication.run(EdtechBackendApplication.class, args);
	}

}
