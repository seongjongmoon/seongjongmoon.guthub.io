// 강의 데이터를 저장하는 배열 (로컬스토리지에 저장)
let courses = [];

// 로컬스토리지에서 강의 데이터 읽기
function loadCourses() {
    const saved = localStorage.getItem('courses');
    if (saved) {
        courses = JSON.parse(saved);
    }
}

// 로컬스토리지에 강의 데이터 저장
function saveCourses() {
    localStorage.setItem('courses', JSON.stringify(courses));
}

// 시간표 초기화 및 렌더링
function initializeSchedule() {
    const scheduleBody = document.getElementById('scheduleBody');
    scheduleBody.innerHTML = '';
    
    // 1교시부터 8교시까지, 30분 단위
    const timeSlots = [
        '09:00', '09:30',
        '10:00', '10:30',
        '11:00', '11:30',
        '12:00', '12:30',
        '13:00', '13:30',
        '14:00', '14:30',
        '15:00', '15:30',
        '16:00', '16:30'
    ];
    
    const days = ['월', '화', '수', '목', '금'];
    
    // 각 시간대별 행 생성
    timeSlots.forEach(time => {
        const row = document.createElement('tr');
        
        // 시간 열
        const timeCell = document.createElement('td');
        timeCell.textContent = time;
        timeCell.className = 'time-column';
        row.appendChild(timeCell);
        
        // 요일별 열 생성
        days.forEach(day => {
            const cell = document.createElement('td');
            cell.id = `${day}-${time}`;
            cell.className = 'schedule-cell';
            row.appendChild(cell);
        });
        
        scheduleBody.appendChild(row);
    });
}

// 폼 제출 이벤트
document.getElementById('courseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const courseName = document.getElementById('courseName').value;
    const classroom = document.getElementById('classroom').value;
    const dayOfWeek = document.getElementById('dayOfWeek').value;
    const startTime = document.getElementById('startTime').value;
    const duration = parseInt(document.getElementById('duration').value);
    
    // 강의 데이터 추가
    const course = {
        id: Date.now(),
        name: courseName,
        classroom: classroom,
        day: dayOfWeek,
        startTime: startTime,
        duration: duration
    };
    
    courses.push(course);
    saveCourses(); // 저장
    
    // UI 업데이트
    renderCourseList();
    renderSchedule();
    
    // 폼 초기화
    this.reset();
});

// 강의 목록 렌더링
function renderCourseList() {
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';
    
    if (courses.length === 0) {
        courseList.innerHTML = '<li class="empty-message">등록된 강의가 없습니다.</li>';
        return;
    }
    
    courses.forEach(course => {
        const li = document.createElement('li');
        li.className = 'course-item';
        
        const endTime = calculateEndTime(course.startTime, course.duration);
        
        li.innerHTML = `
            <div class="course-info">
                <div class="course-name">${course.name}</div>
                <div class="course-details">
                    ${course.day}요일 ${course.startTime} ~ ${endTime} | ${course.classroom}
                </div>
            </div>
            <button class="btn-delete" onclick="deleteCourse(${course.id})">삭제</button>
        `;
        
        courseList.appendChild(li);
    });
}

// 시간표 렌더링 (강의 배치)
function renderSchedule() {
    // 먼저 모든 셀을 초기화
    const cells = document.querySelectorAll('.schedule-cell');
    cells.forEach(cell => {
        cell.innerHTML = '';
    });
    
    // 각 강의를 시간표에 배치
    courses.forEach(course => {
        const startTime = course.startTime;
        const duration = course.duration;
        
        // 시작 시간과 종료 시간 계산
        const startSlots = getTimeSlots(startTime, duration);
        
        startSlots.forEach(time => {
            const cellId = `${course.day}-${time}`;
            const cell = document.getElementById(cellId);
            
            if (cell) {
                const slot = document.createElement('div');
                slot.className = 'time-slot time-slot-with-course';
                slot.innerHTML = `${course.name}<br><small>${course.classroom}</small>`;
                cell.appendChild(slot);
            }
        });
    });
}

// 특정 시간과 기간에 포함되는 모든 시간대 계산
function getTimeSlots(startTime, duration) {
    const allSlots = [
        '09:00', '09:30',
        '10:00', '10:30',
        '11:00', '11:30',
        '12:00', '12:30',
        '13:00', '13:30',
        '14:00', '14:30',
        '15:00', '15:30',
        '16:00', '16:30'
    ];
    
    const startIndex = allSlots.indexOf(startTime);
    const minuteDuration = Math.ceil(duration / 30); // 30분 단위로 변환
    
    return allSlots.slice(startIndex, startIndex + minuteDuration);
}

// 종료 시간 계산
function calculateEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(':').map(Number);
    
    let totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

// 강의 삭제
function deleteCourse(id) {
    if (confirm('이 강의를 삭제하시겠습니까?')) {
        courses = courses.filter(course => course.id !== id);
        saveCourses(); // 저장
        renderCourseList();
        renderSchedule();
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadCourses(); // 저장된 데이터 로드
    initializeSchedule();
    renderCourseList();
    renderSchedule();
});
