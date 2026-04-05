using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Banane.Migrations
{
    /// <inheritdoc />
    public partial class firstmigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ABSENCE",
                columns: table => new
                {
                    IdAbsence = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdEtudiant_fk_Absence = table.Column<int>(type: "int", nullable: false),
                    DateAbsence = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IdMatiere_fk_Absence = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ABSENCE", x => x.IdAbsence);
                });

            migrationBuilder.CreateTable(
                name: "CONVERSATION",
                columns: table => new
                {
                    IdConversation = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nom = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateCreation = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TypeConversation = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CONVERSATION", x => x.IdConversation);
                });

            migrationBuilder.CreateTable(
                name: "FILIERE",
                columns: table => new
                {
                    IdFiliere = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Nom = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FILIERE", x => x.IdFiliere);
                });

            migrationBuilder.CreateTable(
                name: "NIVEAUSCOLAIRE",
                columns: table => new
                {
                    IdNiveauScolaire = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nom = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IdFiliere_fk_NiveauScol = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NIVEAUSCOLAIRE", x => x.IdNiveauScolaire);
                    table.ForeignKey(
                        name: "FK_NIVEAUSCOLAIRE_FILIERE_IdFiliere_fk_NiveauScol",
                        column: x => x.IdFiliere_fk_NiveauScol,
                        principalTable: "FILIERE",
                        principalColumn: "IdFiliere",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UTILISATEUR",
                columns: table => new
                {
                    IdUtilisateur = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nom = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Prenom = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MotDePasse = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DateNaissance = table.Column<DateOnly>(type: "date", nullable: true),
                    photoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NumeroTelephone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Discriminator = table.Column<string>(type: "nvarchar(21)", maxLength: 21, nullable: false),
                    ENSEIGNANT_Matricule = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Matricule = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Filiere = table.Column<int>(type: "int", nullable: true),
                    IdNiveauScolaire_fk_Etudiant = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UTILISATEUR", x => x.IdUtilisateur);
                    table.ForeignKey(
                        name: "FK_UTILISATEUR_NIVEAUSCOLAIRE_IdNiveauScolaire_fk_Etudiant",
                        column: x => x.IdNiveauScolaire_fk_Etudiant,
                        principalTable: "NIVEAUSCOLAIRE",
                        principalColumn: "IdNiveauScolaire",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MATIERE",
                columns: table => new
                {
                    IdMatiere = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Titre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Time = table.Column<int>(type: "int", nullable: true),
                    Jour = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdEnseignant_fk = table.Column<int>(type: "int", nullable: true),
                    IdNiveauScolaire_fk_Matiere = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MATIERE", x => x.IdMatiere);
                    table.ForeignKey(
                        name: "FK_MATIERE_NIVEAUSCOLAIRE_IdNiveauScolaire_fk_Matiere",
                        column: x => x.IdNiveauScolaire_fk_Matiere,
                        principalTable: "NIVEAUSCOLAIRE",
                        principalColumn: "IdNiveauScolaire",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MATIERE_UTILISATEUR_IdEnseignant_fk",
                        column: x => x.IdEnseignant_fk,
                        principalTable: "UTILISATEUR",
                        principalColumn: "IdUtilisateur");
                });

            migrationBuilder.CreateTable(
                name: "MEMBRECONVERSATION",
                columns: table => new
                {
                    IdMembreGroupe = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdMembre_fk_MembreC = table.Column<int>(type: "int", nullable: false),
                    IdConversation_fk_MembreC = table.Column<int>(type: "int", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    createur = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MEMBRECONVERSATION", x => x.IdMembreGroupe);
                    table.ForeignKey(
                        name: "FK_MEMBRECONVERSATION_CONVERSATION_IdConversation_fk_MembreC",
                        column: x => x.IdConversation_fk_MembreC,
                        principalTable: "CONVERSATION",
                        principalColumn: "IdConversation",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MEMBRECONVERSATION_UTILISATEUR_IdMembre_fk_MembreC",
                        column: x => x.IdMembre_fk_MembreC,
                        principalTable: "UTILISATEUR",
                        principalColumn: "IdUtilisateur",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MESSAGE",
                columns: table => new
                {
                    IdMessage = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Contenu = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DateEnvoi = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IdExpediteur_fk = table.Column<int>(type: "int", nullable: false),
                    IdConversation_fk_Message = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MESSAGE", x => x.IdMessage);
                    table.ForeignKey(
                        name: "FK_MESSAGE_CONVERSATION_IdConversation_fk_Message",
                        column: x => x.IdConversation_fk_Message,
                        principalTable: "CONVERSATION",
                        principalColumn: "IdConversation",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MESSAGE_UTILISATEUR_IdExpediteur_fk",
                        column: x => x.IdExpediteur_fk,
                        principalTable: "UTILISATEUR",
                        principalColumn: "IdUtilisateur",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DOCUMENT",
                columns: table => new
                {
                    IdDocument = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdMatiere_fk_Document = table.Column<int>(type: "int", nullable: false),
                    UrlDocument = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TypeDocument = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DOCUMENT", x => x.IdDocument);
                    table.ForeignKey(
                        name: "FK_DOCUMENT_MATIERE_IdMatiere_fk_Document",
                        column: x => x.IdMatiere_fk_Document,
                        principalTable: "MATIERE",
                        principalColumn: "IdMatiere",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DOCUMENT_IdMatiere_fk_Document",
                table: "DOCUMENT",
                column: "IdMatiere_fk_Document");

            migrationBuilder.CreateIndex(
                name: "IX_MATIERE_IdEnseignant_fk",
                table: "MATIERE",
                column: "IdEnseignant_fk");

            migrationBuilder.CreateIndex(
                name: "IX_MATIERE_IdNiveauScolaire_fk_Matiere",
                table: "MATIERE",
                column: "IdNiveauScolaire_fk_Matiere");

            migrationBuilder.CreateIndex(
                name: "IX_MEMBRECONVERSATION_IdConversation_fk_MembreC",
                table: "MEMBRECONVERSATION",
                column: "IdConversation_fk_MembreC");

            migrationBuilder.CreateIndex(
                name: "IX_MEMBRECONVERSATION_IdMembre_fk_MembreC",
                table: "MEMBRECONVERSATION",
                column: "IdMembre_fk_MembreC");

            migrationBuilder.CreateIndex(
                name: "IX_MESSAGE_IdConversation_fk_Message",
                table: "MESSAGE",
                column: "IdConversation_fk_Message");

            migrationBuilder.CreateIndex(
                name: "IX_MESSAGE_IdExpediteur_fk",
                table: "MESSAGE",
                column: "IdExpediteur_fk");

            migrationBuilder.CreateIndex(
                name: "IX_NIVEAUSCOLAIRE_IdFiliere_fk_NiveauScol",
                table: "NIVEAUSCOLAIRE",
                column: "IdFiliere_fk_NiveauScol");

            migrationBuilder.CreateIndex(
                name: "IX_UTILISATEUR_IdNiveauScolaire_fk_Etudiant",
                table: "UTILISATEUR",
                column: "IdNiveauScolaire_fk_Etudiant");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ABSENCE");

            migrationBuilder.DropTable(
                name: "DOCUMENT");

            migrationBuilder.DropTable(
                name: "MEMBRECONVERSATION");

            migrationBuilder.DropTable(
                name: "MESSAGE");

            migrationBuilder.DropTable(
                name: "MATIERE");

            migrationBuilder.DropTable(
                name: "CONVERSATION");

            migrationBuilder.DropTable(
                name: "UTILISATEUR");

            migrationBuilder.DropTable(
                name: "NIVEAUSCOLAIRE");

            migrationBuilder.DropTable(
                name: "FILIERE");
        }
    }
}
