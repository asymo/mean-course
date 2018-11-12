import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent {
  postTitle = '';
  postContent = '';
  @Output() postCreated = new EventEmitter();

  onAddPost() {
    const post = {
      title: this.postTitle,
      content: this.postContent
    };
    this.postCreated.emit(post);
  }
}
