package io.github.csci499_group8.local_hobbies.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
public class S3Config {

    @Value("${application.supabase-s3.endpoint}")
    private String endpoint;

    @Value("${application.supabase-s3.region}")
    private String region;

    @Value("${application.supabase-s3.access-key}")
    private String accessKey;

    @Value("${application.supabase-s3.secret-key}")
    private String secretKey;

    //S3Presigner can generate signed URLs locally because it has been configured
    //with the bucket's name and keys
    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                          .endpointOverride(URI.create(endpoint))
                          .region(Region.of(region)) //ignored by Supabase, but required by SDK
                          .serviceConfiguration(S3Configuration.builder() //honor S3Client's path style
                                                               .pathStyleAccessEnabled(true)
                                                               .build())
                          .credentialsProvider(credentialsProvider())
                          .build();
    }

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                       .endpointOverride(URI.create(endpoint))
                       .region(Region.of(region)) //ignored by Supabase, but required by SDK
                       .forcePathStyle(true) //necessary for Supabase
                       .credentialsProvider(credentialsProvider())
                       .build();
    }

    private StaticCredentialsProvider credentialsProvider() {
        return StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey));
    }

}
