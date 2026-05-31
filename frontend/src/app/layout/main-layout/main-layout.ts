import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "../header/header";
import { Footer } from "../footer/footer";
import { ToastComponent } from '../../shared/components/toast/toast';
import { CompareBar } from '../../shared/components/compare-bar/compare-bar';

@Component({
  selector: 'app-main-layout',
  standalone:true,
  imports: [RouterOutlet, Header, Footer, ToastComponent, CompareBar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

}
