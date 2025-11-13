class AlarmManager {
    constructor() {
        this.alarms = [];
        this.currentAlarm = null;
        this.isPlaying = false;
        
        this.elements = {
            currentTime: document.getElementById('currentTime'),
            alarmTime: document.getElementById('alarmTime'),
            setAlarm: document.getElementById('setAlarm'),
            stopAlarm: document.getElementById('stopAlarm'),
            alarms: document.getElementById('alarms'),
            status: document.getElementById('status'),
            alarmSound: document.getElementById('alarmSound')
        };
        
        this.init();
    }
    
    init() {
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 1000);
        
        this.elements.setAlarm.addEventListener('click', () => this.setAlarm());
        this.elements.stopAlarm.addEventListener('click', () => this.stopAlarm());
        
        // Check alarms every second
        setInterval(() => this.checkAlarms(), 1000);
    }
    
    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID');
        this.elements.currentTime.textContent = timeString;
    }
    
    setAlarm() {
        const alarmTime = this.elements.alarmTime.value;
        
        if (!alarmTime) {
            this.showStatus('Pilih waktu alarm terlebih dahulu!', 'error');
            return;
        }
        
        const [hours, minutes] = alarmTime.split(':');
        const alarm = {
            id: Date.now(),
            time: alarmTime,
            hours: parseInt(hours),
            minutes: parseInt(minutes),
            active: true
        };
        
        this.alarms.push(alarm);
        this.renderAlarms();
        this.showStatus(`Alarm set untuk ${alarmTime}`, 'success');
        this.elements.alarmTime.value = '';
    }
    
    checkAlarms() {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();
        
        // Only check at the beginning of each minute
        if (currentSeconds !== 0) return;
        
        for (const alarm of this.alarms) {
            if (alarm.active && 
                alarm.hours === currentHours && 
                alarm.minutes === currentMinutes) {
                this.triggerAlarm(alarm);
            }
        }
    }
    
    triggerAlarm(alarm) {
        this.currentAlarm = alarm;
        this.isPlaying = true;
        
        // Play alarm sound
        this.elements.alarmSound.play();
        
        // Enable stop button
        this.elements.stopAlarm.disabled = false;
        
        // Show notification
        this.showStatus(`⏰ ALARM! Waktu menunjukkan ${alarm.time}`, 'warning');
        
        // Browser notification (jika diizinkan)
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Alarm Online', {
                body: `Alarm untuk ${alarm.time}!`
            });
        }
    }
    
    stopAlarm() {
        if (this.isPlaying) {
            this.elements.alarmSound.pause();
            this.elements.alarmSound.currentTime = 0;
            this.isPlaying = false;
            this.elements.stopAlarm.disabled = true;
            this.showStatus('Alarm dihentikan', 'success');
            
            // Nonaktifkan alarm yang sedang berjalan
            if (this.currentAlarm) {
                this.deleteAlarm(this.currentAlarm.id);
                this.currentAlarm = null;
            }
        }
    }
    
    deleteAlarm(alarmId) {
        this.alarms = this.alarms.filter(alarm => alarm.id !== alarmId);
        this.renderAlarms();
    }
    
    renderAlarms() {
        if (this.alarms.length === 0) {
            this.elements.alarms.innerHTML = '<p>Tidak ada alarm aktif</p>';
            return;
        }
        
        this.elements.alarms.innerHTML = this.alarms.map(alarm => `
            <div class="alarm-item">
                <span class="alarm-time">${alarm.time}</span>
                <button class="delete-alarm" onclick="alarmManager.deleteAlarm(${alarm.id})">
                    Hapus
                </button>
            </div>
        `).join('');
    }
    
    showStatus(message, type) {
        this.elements.status.textContent = message;
        this.elements.status.className = `status ${type}`;
        
        setTimeout(() => {
            this.elements.status.textContent = '';
            this.elements.status.className = 'status';
        }, 3000);
    }
}

// Request notification permission
if ('Notification' in window) {
    Notification.requestPermission();
}

// Initialize alarm manager
const alarmManager = new AlarmManager();
