// API 테스트 스크립트
const baseURL = 'http://localhost:8080/api/auth';

// RSA 암호화를 위한 간단한 시뮬레이션 (실제 테스트에서는 JSEncrypt 사용)
async function testWithEncryption() {
    console.log('=== RSA 암호화 테스트 시작 ===\n');
    
    // 1. 공개키 가져오기
    console.log('1. RSA 공개키 요청...');
    try {
        const publicKeyResponse = await fetch(`${baseURL}/public-key`);
        const publicKeyData = await publicKeyResponse.json();
        console.log('✓ 공개키 수신 성공');
        console.log(`  키 길이: ${publicKeyData.publicKey.length} 문자`);
        console.log(`  키 시작: ${publicKeyData.publicKey.substring(0, 50)}...`);
    } catch (error) {
        console.error('✗ 공개키 요청 실패:', error.message);
    }
    
    console.log('\n=== 암호화 없이 일반 테스트 진행 ===\n');
}

// 회원가입 테스트
async function testRegister(username, email, password) {
    console.log(`2. 회원가입 테스트 (${username})...`);
    
    try {
        const response = await fetch(`${baseURL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                encryptedPassword: null
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✓ 회원가입 성공');
            console.log(`  사용자명: ${data.username}`);
            console.log(`  메시지: ${data.message}`);
            console.log(`  토큰: ${data.token ? data.token.substring(0, 30) + '...' : 'null'}`);
            return true;
        } else {
            console.log('✗ 회원가입 실패');
            console.log(`  오류: ${data.message}`);
            return false;
        }
    } catch (error) {
        console.error('✗ 회원가입 요청 실패:', error.message);
        return false;
    }
}

// 로그인 테스트
async function testLogin(username, password) {
    console.log(`\n3. 로그인 테스트 (${username})...`);
    
    try {
        const response = await fetch(`${baseURL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                encryptedPassword: null
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✓ 로그인 성공');
            console.log(`  사용자명: ${data.username}`);
            console.log(`  메시지: ${data.message}`);
            console.log(`  토큰: ${data.token ? data.token.substring(0, 30) + '...' : 'null'}`);
            return true;
        } else {
            console.log('✗ 로그인 실패');
            console.log(`  오류: ${data.message}`);
            return false;
        }
    } catch (error) {
        console.error('✗ 로그인 요청 실패:', error.message);
        return false;
    }
}

// 메인 테스트 함수
async function runTests() {
    console.log('====================================');
    console.log('로그인/회원가입 API 테스트 시작');
    console.log('====================================\n');
    
    // RSA 테스트
    await testWithEncryption();
    
    // 테스트 데이터
    const testUser = {
        username: 'testuser' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        password: 'testpass123'
    };
    
    // 회원가입 테스트
    const registerSuccess = await testRegister(testUser.username, testUser.email, testUser.password);
    
    if (registerSuccess) {
        // 로그인 테스트
        await testLogin(testUser.username, testUser.password);
        
        // 잘못된 비밀번호로 로그인 시도
        console.log('\n4. 잘못된 비밀번호로 로그인 시도...');
        await testLogin(testUser.username, 'wrongpassword');
        
        // 중복 회원가입 시도
        console.log('\n5. 중복 회원가입 시도...');
        await testRegister(testUser.username, testUser.email, testUser.password);
    }
    
    console.log('\n====================================');
    console.log('테스트 완료');
    console.log('====================================');
}

// 테스트 실행
runTests().catch(console.error);