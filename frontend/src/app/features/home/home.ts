import { Component } from '@angular/core';
import { Hero } from './components/hero/hero';
import { Trending } from "./components/trending/trending";
import { ExploreColors } from './components/explore-colors/explore-colors';
import { Testimonial } from "./components/testimonial/testimonial";
import { WhyShop } from "./components/why-shop/why-shop";
import { BlogHighlight } from './components/blog-highlight/blog-highlight';

@Component({
  selector: 'app-home',
  imports: [Hero, Trending, ExploreColors, Testimonial, WhyShop, BlogHighlight],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
