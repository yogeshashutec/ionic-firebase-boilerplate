// login.page.ts
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AuthenticateService } from '../services/authentication.service';
import { AlertController } from '@ionic/angular';
import * as firebase from 'firebase/app';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  recaptchaVerifier: firebase.auth.RecaptchaVerifier;

  constructor(

    private navCtrl: NavController,
    private authService: AuthenticateService,
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController

  ) { }

  // tslint:disable-next-line: variable-name
  validations_form: FormGroup;
  errorMessage = '';


  validation_messages = {
    email: [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Please enter a valid email.' }
    ],
    password: [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 5 characters long.' }
    ]
  };

  ngOnInit() {

    this.validations_form = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required
      ])),
    });

    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
  }


  loginUser(value) {
    this.authService.loginUser(value)
      .then(res => {
        console.log(res);
        this.errorMessage = '';
        this.navCtrl.navigateForward('/dashboard');
      }, err => {
        this.errorMessage = err.message;
      });
  }

  goToRegisterPage() {
    this.navCtrl.navigateForward('/register');
  }

  signIn(phoneNumber: number){
    const appVerifier = this.recaptchaVerifier;
    const phoneNumberString = '+' + phoneNumber;
    firebase.auth().signInWithPhoneNumber(phoneNumberString, appVerifier)
      .then( async (confirmationResult) => {
        const prompt = await this.alertCtrl.create({
        inputs: [{ name: 'confirmationCode', placeholder: 'Confirmation Code' }],
        buttons: [
          { text: 'Cancel',
            handler: data => { console.log('Cancel clicked'); }
          },
          { text: 'Send',
            handler: data => {
              confirmationResult.confirm(data.confirmationCode)
              .then(result => {
                console.log(result.user);
              }).catch(error => {
              });
            }
          }
        ]
      });
        await prompt.present();
    })
    .catch(error => {
      console.error('SMS not sent', error);
    });
  }
}
