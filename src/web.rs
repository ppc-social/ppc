use sea_orm::{
    Database,
    DatabaseConnection,
};
use axum::{
    http::StatusCode, response::IntoResponse, routing::{get, get_service}, Router,
    response::Html,
};
use tower_cookies::{CookieManagerLayer, Cookies};
use tower_http::services::ServeDir;
use mize::error::IntoMizeResult;
use std::fs;

use crate::Ppc;
use mize::{mize_err, MizeResult, MizeError};

static DB_URL: &str = "mysql://root:example@ppc-db/ppc";

#[derive(Clone)]
struct AppState {
    //templates: Tera,
    ppc: Ppc,
    conn: DatabaseConnection,
}

pub async fn run_webserver( ppc: Ppc ) -> MizeResult<()> {

    let conn = Database::connect(DB_URL).await.mize_result_msg("Database connection failed")?;

    //Migrator::up(&conn, None).await.unwrap();

    //let templates = Tera::new(concat!(env!("CARGO_MANIFEST_DIR"), "/templates/**/*")).mize_result_msg("Tera initialization failed")?;

    let state = AppState { conn, ppc: ppc.clone() };

    let cloned_ppc = ppc.clone();
    let app = Router::new()
        .route("/", get(ppc_main))
        .route("/impressum", get(ppc_impressum))
        //.route("/{id}", get(edit_post).post(update_post))
        //.route("/new", get(new_post))
        //.route("/delete/{id}", post(delete_post))
        .nest_service(
            "/app/static",
            get_service(ServeDir::new(
                "/modules/ppc/static"
            ))
            .handle_error(|err| async move {
                cloned_ppc.mize.report_err(mize_err!("Err in the static-service of the webserver of the ppc module: {}", err));
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Unhandled internal error: {err}"),
                )
            }),
        )
        .nest_service(
            "/mc",
            get_service(ServeDir::new(
                "/modules/ppc/static/mc"
            ))
        )
        .layer(CookieManagerLayer::new())
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:80").await.unwrap();
    axum::serve(listener, app).await?;

    Ok(())
}


async fn ppc_main() -> impl IntoResponse {
    // Read the file contents at runtime
    match fs::read_to_string("/modules/ppc/static/index.html") {
        Ok(contents) => Html(contents).into_response(),
        Err(_) => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "Failed to load HTML").into_response(),
    }
}
async fn ppc_impressum() -> impl IntoResponse {
    // Read the file contents at runtime
    match fs::read_to_string("/modules/ppc/static/impressum.html") {
        Ok(contents) => Html(contents).into_response(),
        Err(_) => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "Failed to load HTML").into_response(),
    }
}
