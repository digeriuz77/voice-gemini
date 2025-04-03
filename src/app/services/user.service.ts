import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserInfo {
  name?: string;
  age?: number;
  ageGroup: 'early' | 'middle' | 'teen';
  parentAssisted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userInfoSubject = new BehaviorSubject<UserInfo>({
    ageGroup: 'middle',
    parentAssisted: false
  });
  
  userInfo$ = this.userInfoSubject.asObservable();
  
  constructor() {
    // Try to load saved user info
    this.loadSavedUserInfo();
  }
  
  private loadSavedUserInfo() {
    try {
      const savedInfo = localStorage.getItem('dyslexia-screening-user');
      if (savedInfo) {
        const parsedInfo = JSON.parse(savedInfo);
        this.userInfoSubject.next({
          ...this.userInfoSubject.value,
          ...parsedInfo
        });
      }
    } catch (error) {
      console.error('Error loading saved user info:', error);
    }
  }
  
  private saveUserInfo() {
    try {
      localStorage.setItem('dyslexia-screening-user', 
        JSON.stringify(this.userInfoSubject.value));
    } catch (error) {
      console.error('Error saving user info:', error);
    }
  }
  
  getUserInfo(): UserInfo {
    return this.userInfoSubject.value;
  }
  
  getUserAgeGroup(): 'early' | 'middle' | 'teen' {
    return this.userInfoSubject.value.ageGroup;
  }
  
  setUserInfo(info: Partial<UserInfo>) {
    this.userInfoSubject.next({
      ...this.userInfoSubject.value,
      ...info
    });
    this.saveUserInfo();
  }
  
  setAgeGroup(ageGroup: 'early' | 'middle' | 'teen') {
    this.setUserInfo({ ageGroup });
  }
  
  setParentAssisted(assisted: boolean) {
    this.setUserInfo({ parentAssisted: assisted });
  }
  
  clearUserInfo() {
    this.userInfoSubject.next({
      ageGroup: 'middle',
      parentAssisted: false
    });
    localStorage.removeItem('dyslexia-screening-user');
  }
}
