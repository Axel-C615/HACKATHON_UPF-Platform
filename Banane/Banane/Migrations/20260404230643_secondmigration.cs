using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Banane.Migrations
{
    /// <inheritdoc />
    public partial class secondmigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UTILISATEUR_NIVEAUSCOLAIRE_IdNiveauScolaire_fk_Etudiant",
                table: "UTILISATEUR");

            migrationBuilder.AddForeignKey(
                name: "FK_UTILISATEUR_NIVEAUSCOLAIRE_IdNiveauScolaire_fk_Etudiant",
                table: "UTILISATEUR",
                column: "IdNiveauScolaire_fk_Etudiant",
                principalTable: "NIVEAUSCOLAIRE",
                principalColumn: "IdNiveauScolaire");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UTILISATEUR_NIVEAUSCOLAIRE_IdNiveauScolaire_fk_Etudiant",
                table: "UTILISATEUR");

            migrationBuilder.AddForeignKey(
                name: "FK_UTILISATEUR_NIVEAUSCOLAIRE_IdNiveauScolaire_fk_Etudiant",
                table: "UTILISATEUR",
                column: "IdNiveauScolaire_fk_Etudiant",
                principalTable: "NIVEAUSCOLAIRE",
                principalColumn: "IdNiveauScolaire",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
