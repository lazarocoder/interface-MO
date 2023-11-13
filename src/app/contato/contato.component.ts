import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContatoDetalheComponent } from '../contato-detalhe/contato-detalhe.component';
import { ContatoService } from '../service/contato.service';
import { Contato } from './contato';

@Component({
  selector: 'app-contato',
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.css']
})
export class ContatoComponent implements OnInit {

  formulario: FormGroup = new FormGroup({});
  contatos: Contato[] = [];
  colunas = ['foto', 'id', 'nome', 'email', 'favorito'];

  totalElementos = 0;
  pagina = 0;
  tamanho = 5;
  pageSizeOptions: number[] = [5];

  constructor(
    private service: ContatoService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.montarFormulario();
    this.listarContatos(this.pagina, this.tamanho);
  }

  montarFormulario(){
    this.formulario = this.fb.group({
      nome: ['', Validators.required],
      email: ['',[ Validators.email, Validators.required] ]
    });
  }

  listarContatos(page: any = 0, size: any = this.tamanho){
    this.service.list(page, size).subscribe(resposta => {
      this.contatos = resposta.content;
      this.totalElementos = resposta.totalElements;
      this.pagina = resposta.number;
    })
  }

  favoritar(contato: Contato){
    this.service.favorite(contato).subscribe(resposta => {
      contato.favorito = !contato.favorito;
    })
  }

  submit(){
    const formValues = this.formulario.value;
    const contato: Contato = new Contato(formValues.nome, formValues.email);

    this.service.save(contato).subscribe(resposta => {
      this.listarContatos();
      this.snackBar.open('O contato foi adicionado.', 'Sucesso!', {
        duration: 2000
      });
      this.formulario.reset();
    });
  }

  uploadFoto(event: any, contato: Contato){
    const files = event.target.files;
    if(files){
      const foto = files[0];
      const formData: FormData = new FormData();
      formData.append("foto", foto);
      this.service.upload(contato, formData).subscribe(resposta => {
        this.listarContatos();
      });
    }
  }

  visualizarContato(contato: Contato) {
    this.dialog.open(ContatoDetalheComponent, {
      width: '400px',
      height: '450px',
      data: contato
    })
  }

  paginar(event: PageEvent){
    this.pagina = event.pageIndex;
    this.listarContatos(this.pagina, this.tamanho);
  }

//crie uma função para excluir um contato
  excluir(contato: Contato){
    this.service.delete(contato).subscribe(resposta => {
      this.listarContatos();
      this.snackBar.open('O contato foi excluído.', 'Sucesso!', {
        duration: 2000
      });
    });
  }

}
